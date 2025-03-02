import { MIMETypeValue } from "@/constants/mimeType";
import { PageData } from ".";

export interface FileMeta {
	id: number;
	creator_id: number;
	originalFileName: string;
	storageFileName: string;
	filePath: string;
	fileSize: number;
	fileType: MIMETypeValue;
	fileMd5: string;
	access?: string;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	temp_link?: string;
	version: number;
}

export interface DatasetMeta {
	id: number;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
	datasetSize: number;
	fileCount: string;
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
	taskId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	totalChunks: number;
	uploadedChunks: number;
	status?: string;
	chunkStatus?: object;
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	version?: number;
}

export type ReqFileListParams = {
	page: number;
	pageSize: number;
	fileType?: MIMETypeValue | "" | MIMETypeValue[];
	createdStart?: string;
	createdEnd?: string;
	updatedStart?: string;
	updatedEnd?: string;
} & Partial<Pick<FileMeta, "id" | "originalFileName">>;
export type ResFileList = PageData<FileMeta>;

export type ResUploadFile = FileMeta;

export type ReqCreateDataset = {
	name: string;
	description: string;
	file_ids: number[];
};

export type ReqUpdateDataset = Partial<ReqCreateDataset>;

export type ResCreateDataset = DatasetMeta;

export type ResDatasetDetail = DatasetMeta & { fileIds: number[] };

export type ResDatasetList = PageData<DatasetMeta>;

export type ResCreateTask = Required<Pick<TaskMeta, "taskId">> & { chunkSize: number };

export type ResTaskStatus = Pick<
	TaskMeta,
	"taskId" | "status" | "chunkStatus" | "totalChunks" | "uploadedChunks"
>;
