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
	access?: string;
	createdAt?: string;
	updatedAt?: string;
	created_by?: string;
	updated_by?: string;
	temp_link?: string;
	version: number;
}

export interface DatasetMeta {
	id: number;
	name: string;
	description: string;
	creator_id: number;
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
	dataset_size: number;
	file_count: string;
}

export type DiskSpaceStatus = { used: string | null; last_updated: string | null };

export interface DiskUsageReport {
	total: DiskSpaceStatus;
	application: DiskSpaceStatus;
	image: DiskSpaceStatus;
	video: DiskSpaceStatus;
	audio: DiskSpaceStatus;
	app: DiskSpaceStatus;
	other: DiskSpaceStatus;
}

export interface TaskMeta {
	task_id: string;
	file_name: string;
	file_type: string;
	file_size: number;
	total_chunks: number;
	uploaded_chunks: number;
	status?: string;
	chunk_status?: object;
	created_at?: string;
	updated_at?: string;
	created_by?: string;
	updated_by?: string;
	version?: number;
}

export type ReqFileListParams = {
	page: number;
	pageSize: number;
	file_type?: MIMETypeValue | "" | MIMETypeValue[];
	createdStart?: string;
	createdEnd?: string;
	updatedStart?: string;
	updatedEnd?: string;
} & Partial<Pick<FileMeta, "id" | "original_file_name">>;
export type ResFileList = PageData<FileMeta>;

export type ResUploadFile = FileMeta;

export type ReqCreateDataset = {
	name: string;
	description: string;
	file_ids: number[];
};

export type ReqUpdateDataset = Partial<ReqCreateDataset>;

export type ResCreateDataset = DatasetMeta;

export type ResDatasetDetail = DatasetMeta;

export type ResDatasetList = PageData<DatasetMeta>;

export type ResCreateTask = Pick<TaskMeta, "task_id"> & { chunk_size: number };

export type ResTaskStatus = Pick<
	TaskMeta,
	"task_id" | "status" | "chunk_status" | "total_chunks" | "uploaded_chunks"
>;
