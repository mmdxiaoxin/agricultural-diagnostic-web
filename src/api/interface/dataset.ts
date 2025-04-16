import { PageData } from ".";
export interface DatasetMeta {
	id: number;
	name: string;
	access: "public" | "private";
	description: string;
	createdAt: string;
	updatedAt: string;
	createdBy: number;
	updatedBy: number;
	datasetSize: number;
	fileCount: string;
}

export type ReqCreateDataset = {
	name: string;
	description: string;
	fileIds: number[];
};

export type ReqDatasetList = {
	page: number;
	pageSize: number;
	name?: string;
	createdStart?: string;
	createdEnd?: string;
	updatedStart?: string;
	updatedEnd?: string;
};

export type ReqUpdateDataset = Partial<ReqCreateDataset>;

export type ResCreateDataset = DatasetMeta;

export type ResDatasetDetail = DatasetMeta & { fileIds: number[] };

export type ResDatasetList = PageData<DatasetMeta>;
