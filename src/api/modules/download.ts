import http from "@/api";
import { store } from "@/store";
import { concurrencyQueue } from "@/utils";
import axios, { AxiosProgressEvent } from "axios";

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

// * 文件下载接口
export const downloadFile = async (
	fileId: string | number,
	options: DownloadOptions = {},
	url: string = `/api/file/download/${fileId}`
): Promise<Blob> => {
	const token = localStorage.getItem("token") || store.getState().auth.token;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: `Bearer ${token}` },
			responseType: "blob",
			onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
				const progress = progressEvent.total
					? Math.round((progressEvent.loaded / progressEvent.total) * 100)
					: 0;
				if (options.onProgress) {
					options.onProgress(fileId, progress);
				}
			}
		});

		const fileBlob = response.data;

		// 获取文件名
		const contentDisposition = response.headers["content-disposition"];
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
	} catch (error) {
		console.error("文件下载失败", error);
		throw new Error("文件下载失败");
	}
};

// * 批量下载文件
export const downloadMultipleFiles = async (
	fileIds: (string | number)[],
	options: DownloadOptions = {}
) => {
	if (options.compressMode) {
		const response = await http.download(
			"/file/download",
			{ fileIds },
			{
				loading: false,
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
		const downloadPromises = fileIds.map(fileId => () => {
			return downloadFile(fileId, options);
		});

		try {
			return await concurrencyQueue(downloadPromises, {
				concurrency: options.concurrency || 3, // 控制并发数
				onProgress: (completed, total) => {
					const overallProgress = Math.round((completed / total) * 100);
					options.onOverallProgress?.(completed, total);
					console.log(`总体下载进度：${overallProgress}%`);
				}
			});
		} catch (error) {
			console.error("批量下载失败", error);
			throw new Error("批量下载失败");
		}
	}
};
