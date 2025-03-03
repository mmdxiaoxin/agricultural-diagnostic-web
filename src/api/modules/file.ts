import http from "@/api";
import { store } from "@/store";
import { calculateFileMd5, concurrencyQueue, getModelMimeType } from "@/utils";
import { RcFile } from "antd/es/upload";
import axios, { AxiosProgressEvent } from "axios";
import { testSpeed } from ".";
import {
	DiskUsageReport,
	FileMeta,
	ReqCreateDataset,
	ReqFileListParams,
	ReqUpdateDataset,
	ResCreateTask,
	ResDatasetDetail,
	ResDatasetList,
	ResFileList,
	ResTaskStatus,
	ResUploadFile
} from "../interface";

export interface UploadOptions {
	// 可选的进度回调函数
	onProgress?: (fileId: string | number, progress: number) => void;
	// 并发数
	concurrency?: number;
	// 分片大小
	chunkSize?: number;
}

// * 文件列表接口
export const getFileList = async (params: ReqFileListParams) => {
	return http.get<ResFileList>("/file/list", params, { loading: false });
};

// * 文件上传接口
export const uploadSingleFile = async (file: File | RcFile) => {
	const formData = new FormData();
	formData.append("file", file);

	return http.post<ResUploadFile>("/file/upload/single", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		},
		loading: false,
		cancel: false
	});
};

class TaskError extends Error {
	name: string;
	constructor(message: string) {
		super(message);
		this.name = "TaskError";
	}
}

class ChunkError extends Error {
	name: string;
	constructor(message: string) {
		super(message);
		this.name = "ChunkError";
	}
}

class CompleteError extends Error {
	name: string;
	constructor(message: string) {
		super(message);
		this.name = "CompleteError";
	}
}

const errorHandler = (error: any) => {
	if (error instanceof TaskError) {
		throw new Error("TaskError:" + error.message);
	} else if (error instanceof ChunkError) {
		throw new Error("ChunkError:" + error.message);
	} else if (error instanceof CompleteError) {
		throw new Error("CompleteError:" + error.message);
	} else {
		throw new Error(error.message);
	}
};

async function calculateOptimalChunkSize() {
	const NETWORK_SPEED = await testSpeed();
	const MAX_CHUNK = 20 * 1024 * 1024; // 20MB
	const MIN_CHUNK = 1 * 1024 * 1024; // 1MB

	// 根据网络速度计算最佳分片
	return Math.min(
		MAX_CHUNK,
		Math.max(
			MIN_CHUNK,
			Math.round(NETWORK_SPEED * 0.5) // 0.5秒传输量
		)
	);
}

// 重新上传分片的最大重试次数
const MAX_RETRIES = 3;

// * 文件上传接口（分片）
export const uploadChunksFile = async (file: File | RcFile, options?: UploadOptions) => {
	const dynamicChunkSize = await calculateOptimalChunkSize();
	const totalChunks = Math.ceil(file.size / dynamicChunkSize);

	const fileExtension = file.name.match(/\.([^\.]+)$/);
	const fileType = file.type ? file.type : getModelMimeType(fileExtension ? fileExtension[1] : "");
	try {
		const fileMd5 = await calculateFileMd5(file);

		// 1. 创建上传任务
		const taskResp = await createUploadTask(file, fileMd5, totalChunks, fileType);
		if (taskResp.code === 200) {
			return taskResp; // 文件已上传
		}
		if (!taskResp.data) {
			throw new TaskError("创建上传任务失败");
		}
		const taskId = taskResp.data.taskId;

		// 2. 上传文件块
		await uploadFileChunks(file, taskId, fileMd5, totalChunks, dynamicChunkSize, options);

		// 3. 合并文件块
		let completionResp = await completeUpload(taskId);
		if (completionResp.code === 200 || completionResp.code === 201) return completionResp;
		else if (completionResp.code === 202) {
			// 4. 断点续传
			return await retryUpload(file, taskId, fileMd5, dynamicChunkSize, options);
		}
	} catch (error: any) {
		errorHandler(error);
	}
};

// 1. 创建上传任务
const createUploadTask = async (
	file: File | RcFile,
	fileMd5: string,
	totalChunks: number,
	fileType: string
) => {
	const taskResp = await http.post<ResCreateTask>(
		"/file/upload/create",
		{
			fileName: file.name,
			fileSize: file.size,
			fileType,
			totalChunks,
			fileMd5
		},
		{ loading: false, cancel: false }
	);
	if (taskResp.code !== 201 && taskResp.code !== 200 && taskResp.code !== 202) {
		throw new TaskError(taskResp.message);
	}
	return taskResp;
};

// 上传单个文件块
const uploadChunk = async (taskId: string, fileMd5: string, chunkIndex: number, chunk: Blob) => {
	const formData = new FormData();
	formData.append("taskId", taskId);
	formData.append("fileMd5", fileMd5);
	formData.append("chunkIndex", chunkIndex.toString());
	formData.append("chunk", chunk);
	return http.post("/file/upload/chunk", formData, {
		cancel: false,
		loading: false
	});
};

// 错误捕获并重试机制
const uploadChunkWithRetry = async (
	taskId: string,
	fileMd5: string,
	chunkIndex: number,
	chunk: Blob,
	retries: number = 0
) => {
	try {
		return await uploadChunk(taskId, fileMd5, chunkIndex, chunk);
	} catch (error) {
		if (retries < MAX_RETRIES) {
			console.log(`分片 ${chunkIndex} 上传失败，正在重试... 重试次数: ${retries + 1}`);
			return await uploadChunkWithRetry(taskId, fileMd5, chunkIndex, chunk, retries + 1);
		} else {
			throw new ChunkError(`分片 ${chunkIndex} 上传失败，重试次数已达到最大值`);
		}
	}
};

// 2. 上传文件块
const uploadFileChunks = async (
	file: File | RcFile,
	taskId: string,
	fileMd5: string,
	totalChunks: number,
	chunkSize: number,
	options?: UploadOptions
) => {
	const uploadTasks: (() => Promise<any>)[] = [];

	for (let i = 0; i < totalChunks; i++) {
		const chunkStart = i * chunkSize;
		const chunkEnd = Math.min(chunkStart + chunkSize, file.size);
		const chunk = file.slice(chunkStart, chunkEnd);

		if (!chunk) continue; // 忽略空的分片

		// 使用带重试机制的上传函数
		uploadTasks.push(() => uploadChunkWithRetry(taskId, fileMd5, i + 1, chunk));
	}

	const concurrency = options?.concurrency || 5;
	await concurrencyQueue(uploadTasks, {
		concurrency,
		onProgress: (completed, total) => {
			if ((file as RcFile).uid) {
				options?.onProgress?.((file as RcFile).uid, Math.round((completed / total) * 100));
			}
		}
	});
};

// 3. 完成上传
const completeUpload = async (taskId: string) => {
	const response = await http.post(
		"/file/upload/complete",
		{ taskId },
		{ loading: false, cancel: false }
	);
	if (response.code !== 200 && response.code !== 201) {
		throw new CompleteError(response.message);
	}
	return response;
};

// 4. 断点续传
const retryUpload = async (
	file: File | RcFile,
	taskId: string,
	fileMd5: string,
	chunkSize: number,
	options?: UploadOptions
) => {
	let retryCount = 0;
	const maxRetryCount = 3; // 最大重试次数

	while (retryCount < maxRetryCount) {
		const taskStatusResp = await http.get<ResTaskStatus>(
			`/file/upload/status/${taskId}`,
			{},
			{ loading: false, cancel: false }
		);
		if (taskStatusResp.code !== 200) {
			throw new Error(taskStatusResp.message);
		}
		if (!taskStatusResp.data) {
			throw new Error("上传失败，无法获取任务状态");
		}

		const chunkStatus = taskStatusResp.data.chunkStatus;
		if (!chunkStatus) {
			throw new Error("上传失败，无法获取失败的文件块");
		}

		const failedChunkIndexes = Object.keys(chunkStatus)
			.map(index => parseInt(index, 10))
			.filter(index => !chunkStatus[index]);
		const retryTasks = failedChunkIndexes.map(
			chunkIndex => () =>
				uploadChunk(
					taskId,
					fileMd5,
					chunkIndex,
					file.slice((chunkIndex - 1) * chunkSize, chunkIndex * chunkSize)
				)
		);

		await concurrencyQueue(retryTasks, { concurrency: options?.concurrency || 5 });
		const completionResp = await completeUpload(taskId);
		if (completionResp.code === 200 || completionResp.code === 201) return completionResp;
		retryCount++;
		if (retryCount === maxRetryCount) {
			throw new Error("重试超过最大次数，上传失败");
		}
	}
};

export interface DownloadProgress {
	[fileId: string]: number; // 每个文件的下载进度
}

export interface DownloadOptions {
	// 可选的进度回调函数
	onProgress?: (fileId: string | number, progress: number) => void;
	// 可选的总体进度回调函数
	onOverallProgress?: (completed: number, total: number) => void;
	// 可选的文件类型映射
	fileNameMapping?: { [fileId: string]: string };
	// 是否创建下载链接
	createLink?: boolean;
	// 并发数
	concurrency?: number;
	// 是否压缩模式
	compressMode?: boolean;
}

// * 文件下载接口 - 支持断点续传
export const downloadFile = async (
	fileId: string | number,
	options: DownloadOptions = {},
	url: string = `/api/file/download/${fileId}`
): Promise<Blob> => {
	const token = localStorage.getItem("token") || store.getState().auth.token;
	let startByte = 0;
	let fileBlob: Blob | null = null;
	let totalDownloaded = 0; // 累计已下载的字节数

	// 请求文件的大小
	const headResponse = await axios.head(url, { headers: { Authorization: `Bearer ${token}` } });
	const totalSize = parseInt(headResponse.headers["content-length"] || "0", 10);

	if (totalSize === 0) {
		throw new Error("文件下载失败，文件大小为 0");
	}

	// 分片下载
	const CHUNK_SIZE = 10 * 1024 * 1024; // 每片 10MB
	const fileChunks: Blob[] = [];

	while (startByte < totalSize) {
		const endByte = Math.min(startByte + CHUNK_SIZE - 1, totalSize - 1);
		const range = `bytes=${startByte}-${endByte}`;

		const response = await axios.get(url, {
			headers: { Range: range, Authorization: `Bearer ${token}` },
			responseType: "blob",
			onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
				totalDownloaded += progressEvent.loaded;

				// 确保进度不会超过100%
				const progress = Math.min(Math.round((totalDownloaded / totalSize) * 100), 100);

				// 调用传入的进度回调函数
				if (options.onProgress) {
					options.onProgress(fileId, progress);
				}
			}
		});

		if (response.status !== 206) {
			throw new Error("文件下载失败，服务器不支持断点续传");
		}

		// 将每次下载的文件块加入到数组
		fileChunks.push(response.data);

		// 更新下载的起始位置
		startByte = endByte + 1;
	}

	// 合并所有下载的文件块
	fileBlob = new Blob(fileChunks);

	// 获取文件名和扩展名
	const contentDisposition = headResponse.headers["content-disposition"];
	const fileName = contentDisposition
		? decodeURIComponent(contentDisposition.split("filename=")[1].replace(/"/g, ""))
		: `file_${fileId}`;

	// 创建下载链接
	if (options.createLink) {
		const downloadLink = document.createElement("a");
		downloadLink.href = URL.createObjectURL(fileBlob);
		downloadLink.download = options.fileNameMapping?.[fileId] || fileName;
		downloadLink.click();
	}

	return fileBlob;
};

// * 批量下载文件
export const downloadMultipleFiles = async (
	fileIds: (string | number)[],
	options: DownloadOptions = {}
) => {
	if (options.compressMode) {
		const response = await http.download(
			"/file/download/",
			{ fileIds },
			{
				loading: false,
				cancel: false,
				onDownloadProgress(progressEvent) {
					const progress = progressEvent.total
						? Math.round((progressEvent.loaded / progressEvent.total) * 100)
						: 0;
					options.onOverallProgress?.(progress, 100);
				}
			}
		);
		if (!response) throw new Error("下载失败，服务器未返回文件流");
		// 创建 Blob 对象
		const fileBlob = new Blob([response]);
		// 创建下载链接
		if (options.createLink) {
			const downloadLink = document.createElement("a");
			downloadLink.href = URL.createObjectURL(fileBlob);
			downloadLink.download = `download-${Date.now()}.zip`;
			downloadLink.click();
		}
	} else {
		// 通过并发队列来控制文件下载的并发数
		const downloadPromises = fileIds.map(fileId => () => downloadFile(fileId, options));
		return concurrencyQueue(downloadPromises, {
			concurrency: options.concurrency || 3, // 控制并发数
			onProgress: (completed, total) => {
				// 批量下载进度的回调
				const overallProgress = Math.round((completed / total) * 100);
				options.onOverallProgress?.(completed, total);
				console.log(`总体下载进度：${overallProgress}%`);
			}
		});
	}
};

// * 文件修改
export const updateFile = (
	fileId: string | number,
	fileMeta?: Partial<Pick<FileMeta, "access" | "originalFileName">>
) => http.put(`/file/update`, { fileId, ...fileMeta }, { loading: false });

// * 批量文件权限修改
export const updateFilesAccess = (fileIds: (string | number)[], access: string) =>
	http.put("/file/access", { fileIds, access }, { loading: false });

// * 文件删除
export const deleteFile = (fileId: string | number) =>
	http.delete(`/file/delete/${fileId}`, {}, { cancel: false });

// * 批量文件删除
export const deleteFiles = (fileIds: string) => http.delete(`/file/delete`, { fileIds });

// * 获取空间使用情况
export const getDiskUsage = async () =>
	http.get<DiskUsageReport>("/file/disk-usage", {}, { loading: false });
