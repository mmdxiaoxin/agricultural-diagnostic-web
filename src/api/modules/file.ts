import http from "@/api";
import { store } from "@/store";
import axios, { AxiosProgressEvent } from "axios";
import { ReqFileListParams, ResFileList, ResUploadFile } from "../interface";

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

// * 文件下载接口 - 支持断点续传
export const downloadFile = async (fileId: string | number) => {
	const url = `/api/file/download/${fileId}`; // 后端接口
	const token = localStorage.getItem("token") || store.getState().auth.token;

	let startByte = 0;
	let fileBlob: Blob | null = null;

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
				const progress = Math.round((progressEvent.loaded / totalSize) * 100);
				console.log(`下载进度：${progress}%`);
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

	// 创建文件下载链接
	const link = document.createElement("a");
	link.href = URL.createObjectURL(fileBlob);
	link.download = fileName;
	link.click();
};

// * 文件删除接口
export const deleteFile = (fileId: string | number) => http.delete(`/file/delete/${fileId}`);
