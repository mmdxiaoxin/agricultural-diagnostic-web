import http from "@/api";
import { FileMeta, ReqFileListParams, ResFileList, ResFiles, DiskUsageReport } from "../interface";

// * 文件列表接口(分页)
export const getFileList = async (params: ReqFileListParams) => {
	return http.get<ResFileList>("/api/file/list", params, { loading: false });
};

// * 文件列表接口
export const getAllFiles = async () => {
	return http.get<ResFiles>("/api/file", {}, { loading: false });
};

// * 文件修改
export const updateFile = (
	fileId: string | number,
	fileMeta?: Partial<Pick<FileMeta, "access" | "originalFileName">>
) => http.put(`/api/file/update`, { fileId, ...fileMeta }, { loading: false });

// * 批量文件权限修改
export const updateFilesAccess = (fileIds: (string | number)[], access: string) =>
	http.put("/api/file/access", { fileIds, access }, { loading: false });

// * 文件删除
export const deleteFile = (fileId: string | number) => http.delete(`/api/file/delete/${fileId}`);

// * 批量文件删除
export const deleteFiles = (fileIds: string) => http.delete(`/api/file/delete`, { fileIds });

// * 获取空间使用情况
export const getDiskUsage = async () =>
	http.get<DiskUsageReport>("/api/file/disk-usage", {}, { loading: false });
