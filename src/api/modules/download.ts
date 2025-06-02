import http from "@/api";
import { concurrencyQueue } from "@/utils";
import { AxiosProgressEvent } from "axios";

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

/**
 * @description: 通过浏览器下载文件
 * @param {string | number} fileId
 * @param {string} [fileName] 可选的文件名
 * @return {Promise<void>}
 */
export const downloadFileByUrl = async (
	fileId: string | number,
	fileName?: string
): Promise<void> => {
	try {
		const response = await http.get<{ token: string }>(
			`/api/file/download-token/${fileId}`,
			{},
			{ loading: false }
		);
		if (!response.data) throw new Error("下载失败，服务器未返回内容");

		// 构建下载链接
		const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
		const apiPrefix = import.meta.env.PROD ? "/api" : "";
		let downloadUrl = `${baseUrl}${apiPrefix}/file/access-link/${response.data.token}`;
		if (fileName) {
			downloadUrl += `?filename=${encodeURIComponent(fileName)}`;
		}

		console.log("下载链接:", downloadUrl);

		// 尝试不同的下载方式
		try {
			// 方式1：使用 window.location.href
			window.location.href = downloadUrl;
		} catch (error) {
			console.error("方式1失败:", error);
			try {
				// 方式2：使用 window.open
				const downloadWindow = window.open(downloadUrl, "_blank");
				if (!downloadWindow) {
					throw new Error("浏览器阻止了下载窗口的打开");
				}
			} catch (error) {
				console.error("方式2失败:", error);
				// 方式3：创建临时链接
				const link = document.createElement("a");
				link.href = downloadUrl;
				link.target = "_blank";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	} catch (error) {
		console.error("文件下载失败", error);
		throw new Error("文件下载失败");
	}
};

// * 文件下载接口
export const downloadFile = async (
	fileId: string | number,
	options: DownloadOptions = {}
): Promise<Blob> => {
	try {
		console.log("开始下载文件:", fileId);
		let lastLoaded = 0;
		const response = await http.get_blob(
			`/api/file/download/${fileId}`,
			{},
			{
				loading: false,
				onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
					console.log("下载进度事件:", progressEvent);
					let progress = 0;

					if (progressEvent.total) {
						// 如果有 total 值，使用精确计算
						progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
					} else {
						// 如果没有 total 值，使用增量估算
						const increment = progressEvent.loaded - lastLoaded;
						if (increment > 0) {
							// 假设每次增量是总大小的 1%
							progress = Math.min(
								99,
								Math.round((progressEvent.loaded / (progressEvent.loaded + increment * 100)) * 100)
							);
						}
					}

					lastLoaded = progressEvent.loaded;
					console.log(
						"单个文件下载进度:",
						fileId,
						progress,
						progressEvent.loaded,
						progressEvent.total
					);

					if (options.onProgress) {
						options.onProgress(fileId, progress);
					}
				}
			}
		);
		console.log("文件下载完成:", fileId);

		// 下载完成后强制设置为 100%
		if (options.onProgress) {
			options.onProgress(fileId, 100);
		}

		// 将 BlobPart 转换为 Blob
		const fileBlob = new Blob([response]);

		// 创建下载链接
		if (options.createLink) {
			const url = URL.createObjectURL(fileBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = url;
			downloadLink.download = options.fileNameMapping?.[fileId] || `file_${fileId}`;

			// 将链接添加到文档中
			document.body.appendChild(downloadLink);

			// 触发下载
			downloadLink.click();

			// 清理资源
			setTimeout(() => {
				window.URL.revokeObjectURL(url);
				if (downloadLink.parentNode) {
					downloadLink.parentNode.removeChild(downloadLink);
				}
			}, 100);
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
		const response = await http.post_blob(
			"/api/file/download",
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
			const url = URL.createObjectURL(fileBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = url;
			downloadLink.download = `download-${Date.now()}.zip`;
			downloadLink.click();

			// 清理资源
			window.URL.revokeObjectURL(url);
			document.body.removeChild(downloadLink);
		}
	} else {
		// 通过并发队列来控制文件下载的并发数
		const downloadPromises = fileIds.map(fileId => () => {
			return downloadFile(fileId, {
				...options,
				onProgress: (id, progress) => {
					console.log("批量下载进度更新:", id, progress);
					options.onProgress?.(id, progress);
				}
			});
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
