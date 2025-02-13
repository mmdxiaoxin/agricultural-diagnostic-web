import { MIMETypeValue } from "@/constants/mimeType";
import { PageData } from ".";

export interface FileMeta {
	id: number;
	creator_id: number;
	original_file_name: string;
	storage_file_name: string;
	file_path: string;
	file_size: number;
	file_type: MIMETypeValue;
	file_md5: string;
	createdAt?: string;
	updatedAt?: string;
	created_by?: string;
	updated_by?: string;
	temp_link?: string;
	version: number;
}

export type ReqFileListParams = {
	page: number;
	pageSize: number;
	file_type?: MIMETypeValue | MIMETypeValue[];
} & Partial<Pick<FileMeta, "id" | "original_file_name">>;
export type ResFileList = PageData<FileMeta>;

export type ResUploadFile = FileMeta;
