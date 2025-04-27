import http from "@/api";
import { FileMeta, ReqFileListParams, ResFileList, ResFiles, DiskUsageReport } from "../interface";

// * 文件列表接口(分页)
export const getFileList = async (params: ReqFileListParams) => {
	return http.get<ResFileList>("/file/list", params, { loading: false });
};

// * 文件列表接口
export const getAllFiles = async () => {
	return http.get<ResFiles>("/file", {}, { loading: false });
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
export const deleteFile = (fileId: string | number) => http.delete(`/file/delete/${fileId}`);

// * 批量文件删除
export const deleteFiles = (fileIds: string) => http.delete(`/file/delete`, { fileIds });

// * 获取空间使用情况
export const getDiskUsage = async () =>
	http.get<DiskUsageReport>("/file/disk-usage", {}, { loading: false });
