import http from "@/api";
import { calculateFileMd5, concurrencyQueue, getModelMimeType } from "@/utils";
import { RcFile } from "antd/es/upload";
import { testSpeed } from ".";
import { ResCreateTask, ResTaskStatus, ResUploadFile } from "../interface";

export interface UploadOptions {
	// 可选的进度回调函数
	onProgress?: (fileId: string | number, progress: number) => void;
	// 并发数
	concurrency?: number;
	// 分片大小
	chunkSize?: number;
}

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
	const MAX_CHUNK = 5 * 1024 * 1024; // 5MB
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

// * 文件上传接口
export const uploadSingleFile = async (file: File | RcFile) => {
	const formData = new FormData();
	formData.append("file", file);

	return http.post<ResUploadFile>("/api/file/upload/single", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		},
		loading: false
	});
};

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
		"/api/file/upload/create",
		{
			fileName: file.name,
			fileSize: file.size,
			fileType,
			totalChunks,
			fileMd5
		},
		{ loading: false }
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
	return http.post("/api/file/upload/chunk", formData, {
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
	const response = await http.post("/api/file/upload/complete", { taskId }, { loading: false });
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
			`/api/file/upload/status/${taskId}`,
			{},
			{ loading: false }
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
