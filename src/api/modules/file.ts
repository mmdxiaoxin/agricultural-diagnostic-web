import http from "@/api";
import { ReqFileList, ResFileList, ResUploadFile } from "../interface";

// 文件列表接口
export const getFileList = async (params: ReqFileList) => {
	return http.get<ResFileList>("/file/list", params);
};

// 文件上传接口
export const uploadFile = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return http.post<ResUploadFile>("/file/upload/single", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// 文件下载接口
export const downloadFile = (fileId: string | number) => {
	return http.get(`/file/download/${fileId}`, undefined, {
		responseType: "blob"
	});
};

// 文件删除接口
export const deleteFile = (fileId: string | number) => {
	return http.delete(`/file/delete/${fileId}`);
};
