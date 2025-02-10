import http from "@/api";
import { OSSFile } from "../interface";

// 文件列表接口
export const getFileList = async (params: OSSFile.FileListReq) => {
	return http.get("/file/list", params);
};

// 文件上传接口
export const uploadFile = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return http.post<OSSFile.FileMeta>("/file/upload/single", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// 文件下载接口
export const downloadFile = (fileId: string) => {
	return http.get(`/file/download/${fileId}`, undefined, {
		responseType: "blob"
	});
};

// 文件删除接口
export const deleteFile = (fileId: string) => {
	return http.delete(`/file/delete/${fileId}`);
};
