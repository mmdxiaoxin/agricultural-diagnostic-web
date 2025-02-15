import http from "@/api";
import { store } from "@/store";
import { concurrencyQueue } from "@/utils";
import { RcFile } from "antd/es/upload";
import axios, { AxiosProgressEvent } from "axios";
import {
	DiskUsageReport,
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
		loading: false
	});
};

// * 文件上传接口（分片）
export const uploadChunksFile = async (file: File | RcFile, options?: UploadOptions) => {
	const chunkSize = options?.chunkSize || 10 * 1024 * 1024; // 默认每个文件块的大小 10MB
	const totalChunks = Math.ceil(file.size / chunkSize); // 总的分片数量

	try {
		// 1. 创建上传任务
		const taskResp = await http.post<ResCreateTask>(
			"/file/upload/create",
			{
				file_name: file.name,
				file_size: file.size,
				file_type: file.type,
				total_chunks: totalChunks
			},
			{
				loading: false
			}
		);

		if ((taskResp.code !== 200 && taskResp.code !== 201) || !taskResp.data) {
			throw new Error(taskResp.message);
		}

		const task_id = taskResp.data.task_id;

		// 2. 上传文件块
		const uploadTasks = [];

		// 遍历每个分片并将其上传
		for (let i = 0; i < totalChunks; i++) {
			const chunkStart = i * chunkSize;
			const chunkEnd = Math.min(chunkStart + chunkSize, file.size);
			const chunk = file.slice(chunkStart, chunkEnd);

			if (!chunk) continue; // 忽略空的分片

			const uploadTask = async () => {
				const formData = new FormData();
				formData.append("task_id", task_id);
				formData.append("chunkIndex", (i + 1).toString()); // 从 1 开始的 chunkIndex
				formData.append("file", chunk);

				const uploadResp = await http.post("/file/upload/chunk", formData, {
					cancel: false,
					loading: false
				});

				if (uploadResp.code !== 200) {
					throw new Error(`上传第 ${i + 1} 个文件块失败`);
				}

				return uploadResp;
			};

			uploadTasks.push(uploadTask);
		}

		// 使用并发队列执行上传文件块
		const concurrency = options?.concurrency || 5;
		await concurrencyQueue(uploadTasks, {
			concurrency,
			onProgress: (completed, total) => {
				// 显示上传进度
				if (options?.onProgress) {
					if ((file as RcFile).uid)
						options.onProgress((file as RcFile).uid, Math.round((completed / total) * 100));
					else options.onProgress(file.name, Math.round((completed / total) * 100));
				}
			}
		});

		// 3. 合并文件块
		let completionResp = await http.post("/file/upload/complete", { task_id }, { loading: false });

		// 检查上传完成状态
		if (completionResp.code === 200) {
			console.log("文件已上传完成，无需继续处理");
			return completionResp; // 文件已经上传完成，直接返回
		} else if (completionResp.code === 201) {
			console.log("文件分块已合并完成，上传成功");
			return completionResp; // 分片已经成功合并，上传成功
		} else if (completionResp.code === 202) {
			console.log("部分文件块未上传，继续重试上传");
		} else if (completionResp.code === 400) {
			console.error("上传任务失败，请检查上传的文件块");
			throw new Error("上传任务失败");
		}

		// 4. 断点续传
		let retryCount = 0;
		const maxRetryCount = 3; // 最大重试次数

		while (completionResp.code === 202 && retryCount < maxRetryCount) {
			// 获取任务状态
			const taskStatusResp = await http.get<ResTaskStatus>(
				`/file/upload/status/${task_id}`,
				{},
				{ loading: false }
			);

			if (taskStatusResp.code !== 200 || !taskStatusResp.data) {
				throw new Error(taskStatusResp.message);
			}

			// 重新上传失败的文件块
			const failedChunks = taskStatusResp.data.chunk_status;
			if (!failedChunks) {
				throw new Error("上传失败，无法获取失败的文件块");
			}

			const failedChunkIndexes = Object.keys(failedChunks).map(Number);
			const retryTasks = failedChunkIndexes.map(chunkIndex => {
				const chunkStart = (chunkIndex - 1) * chunkSize;
				const chunkEnd = Math.min(chunkStart + chunkSize, file.size);
				const chunk = file.slice(chunkStart, chunkEnd);

				return async () => {
					const formData = new FormData();
					formData.append("task_id", task_id);
					formData.append("chunkIndex", chunkIndex.toString());
					formData.append("file", chunk);

					const uploadResp = await http.post("/file/upload/chunk", formData, {
						cancel: false,
						loading: false
					});
					if (uploadResp.code !== 200) {
						throw new Error(`上传第 ${chunkIndex} 个文件块失败`);
					}
					return uploadResp;
				};
			});

			await concurrencyQueue(retryTasks, { concurrency });

			// 重新合并文件块
			completionResp = await http.post("/file/upload/complete", { task_id }, { loading: false });

			retryCount++; // 重试次数加 1
			if (retryCount === maxRetryCount) {
				throw new Error("重试超过最大次数，上传失败");
			}

			if (completionResp.code === 200 || completionResp.code === 201) {
				break;
			}

			if (completionResp.code === 202) continue;
		}

		return completionResp;
	} catch (error) {
		console.error("文件上传失败", error);
		throw error;
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
}

// * 文件下载接口 - 支持断点续传
export const downloadFile = async (
	fileId: string | number,
	options: DownloadOptions = {}
): Promise<Blob> => {
	const url = `/api/file/download/${fileId}`; // 后端接口
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
): Promise<Blob[]> => {
	const downloadPromises = fileIds.map(fileId => () => downloadFile(fileId, options));

	// 通过并发队列来控制文件下载的并发数
	return await concurrencyQueue(downloadPromises, {
		concurrency: options.concurrency || 3, // 控制并发数
		onProgress: (completed, total) => {
			// 批量下载进度的回调
			const overallProgress = Math.round((completed / total) * 100);
			options.onOverallProgress?.(completed, total);
			console.log(`总体下载进度：${overallProgress}%`);
		}
	});
};

// * 文件名称修改
export const renameFile = (fileId: string | number, newFileName: string) =>
	http.put(`/file/rename/${fileId}`, { newFileName });

// * 文件删除接口
export const deleteFile = (fileId: string | number) => http.delete(`/file/delete/${fileId}`);

// * 获取数据集列表
export const getDatasetsList = async () =>
	http.get<ResDatasetList>("/file/datasets/list", {}, { loading: false });

// * 获取数据集详情
export const getDatasetDetail = async (datasetId: number) =>
	http.get<ResDatasetDetail>(`/file/datasets/${datasetId}`, {}, { loading: false });

// * 创建数据集
export const createDataset = (params: ReqCreateDataset) =>
	http.post<null>("/file/datasets/create", params, { loading: false });

// * 修改数据集
export const updateDataset = (datasetId: number, params: ReqUpdateDataset) =>
	http.put(`/file/datasets/${datasetId}`, params, { loading: false });

// * 删除数据集
export const deleteDataset = (datasetId: number) =>
	http.delete(`/file/datasets/${datasetId}`, {}, { cancel: false });

// * 获取空间使用情况
export const getDiskUsage = async () =>
	http.get<DiskUsageReport>("/file/disk-usage", {}, { loading: false });
