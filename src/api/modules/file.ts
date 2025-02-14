import http from "@/api";
import { store } from "@/store";
import { concurrencyQueue } from "@/utils";
import axios, { AxiosProgressEvent } from "axios";
import {
	ReqCreateDataset,
	ReqFileListParams,
	ReqUpdateDataset,
	ResDatasetDetail,
	ResDatasetList,
	ResFileList,
	ResUploadFile
} from "../interface";

// * 文件列表接口
export const getFileList = async (params: ReqFileListParams) => {
	return http.get<ResFileList>("/file/list", params, { loading: false });
};

// * 文件上传接口
export const uploadFile = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("filename", encodeURIComponent(file.name));

	return http.post<ResUploadFile>("/file/upload/single", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		},
		loading: false
	});
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
		? contentDisposition.split("filename=")[1].replace(/"/g, "")
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
export const deleteDataset = (datasetId: number) => http.delete(`/file/datasets/${datasetId}`);
