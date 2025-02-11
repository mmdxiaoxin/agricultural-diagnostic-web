import { ApiResponse, PageData } from ".";

export namespace OSSFile {
	export interface FileMeta {
		id: number;
		creator_id: number;
		original_file_name: string;
		storage_file_name: string;
		file_path: string;
		file_size: number;
		file_type: string;
		file_md5: string;
		created_at?: Date;
		updated_at?: Date;
		created_by?: string;
		updated_by?: string;
		version: number;
	}

	export interface ReqFileList {
		page: number;
		page_size: number;
	}

	export type ResFileList = ApiResponse<PageData<FileMeta>>;
}
