import { PageData } from ".";

export interface FileMeta {
	id: number;
	creator_id: number;
	original_file_name: string;
	storage_file_name: string;
	file_path: string;
	file_size: number;
	file_type: string;
	file_md5: string;
	createdAt?: string;
	updatedAt?: string;
	created_by?: string;
	updated_by?: string;
	version: number;
}

export type ReqFileListParams = {
	page: number;
	pageSize: number;
} & Partial<Pick<FileMeta, "id" | "original_file_name" | "file_type">>;
export type ResFileList = PageData<FileMeta>;

export type ResUploadFile = FileMeta;
