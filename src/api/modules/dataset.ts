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
	http.get<ResDatasetList>("/dataset/list", params, { loading: false });

// * 获取数据集详情
export const getDatasetDetail = async (datasetId: number) =>
	http.get<ResDatasetDetail>(`/dataset/${datasetId}`, {}, { loading: false });

// * 创建数据集
export const createDataset = (params: ReqCreateDataset) =>
	http.post<null>("/dataset/create", params, { loading: false });

// * 修改数据集
export const updateDataset = (datasetId: number, params: ReqUpdateDataset) =>
	http.put(`/dataset/${datasetId}`, params, { loading: false });

// * 删除数据集
export const deleteDataset = (datasetId: number) =>
	http.delete(`/dataset/${datasetId}`, {}, { cancel: false });
