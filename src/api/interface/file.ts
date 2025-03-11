import { MIMETypeValue } from "@/constants/mimeType";
import { PageData } from ".";

export interface FileMeta {
	id: number;
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
	chunkStatus?: {
		[key: number]: boolean;
	};
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	version?: number;
}

export type ReqFileListParams = {
	page: number;
	pageSize: number;
	fileType?: string;
	createdStart?: string;
	createdEnd?: string;
	updatedStart?: string;
	updatedEnd?: string;
} & Partial<Pick<FileMeta, "originalFileName">>;

export type ResFileList = PageData<FileMeta>;

export type ResFiles = FileMeta[];

export type ResUploadFile = FileMeta;

export type ResCreateTask = Required<Pick<TaskMeta, "taskId">> & { chunkSize: number };

export type ResTaskStatus = Required<
	Pick<TaskMeta, "taskId" | "status" | "chunkStatus" | "totalChunks" | "uploadedChunks">
>;
