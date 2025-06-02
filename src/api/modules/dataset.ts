import http from "@/api";
import {
	ReqCreateDataset,
	ReqDatasetList,
	ReqUpdateDataset,
	ResDatasetDetail,
	ResDatasetList
} from "../interface";

// * 获取数据集列表
export const getDatasetsList = async (params: ReqDatasetList) =>
	http.get<ResDatasetList>("/api/dataset/list", params, { loading: false });

// * 获取公共数据集列表
export const getPublicDatasetsList = async (params: ReqDatasetList) =>
	http.get<ResDatasetList>("/api/dataset/public/list", params, { loading: false });

// * 获取数据集详情
export const getDatasetDetail = async (datasetId: number) =>
	http.get<ResDatasetDetail>(`/api/dataset/${datasetId}`, {}, { loading: false });

// * 创建数据集
export const createDataset = (params: ReqCreateDataset) =>
	http.post<null>("/api/dataset/create", params, { loading: false });

// * 复制数据集
export const copyDataset = (datasetId: number) =>
	http.post<ResDatasetDetail>(`/api/dataset/${datasetId}/copy`, {}, { loading: false });

// * 修改数据集
export const updateDataset = (datasetId: number, params: ReqUpdateDataset) =>
	http.put(`/api/dataset/${datasetId}`, params, { loading: false });

// * 修改数据集访问权限
export const updateDatasetAccess = (datasetId: number, access: "public" | "private") =>
	http.put(`/api/dataset/${datasetId}/access`, { access }, { loading: false });

// * 删除数据集
export const deleteDataset = (datasetId: number) => http.delete(`/api/dataset/${datasetId}`);

// *下载数据集
export const downloadDataset = (datasetId: number) =>
	http.get_blob(`/api/dataset/${datasetId}/download`, {}, { loading: false });
