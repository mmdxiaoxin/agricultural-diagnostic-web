import http from "@/api";
import {
	ReqCreateCrop,
	ReqCropList,
	ReqUpdateCrop,
	ResCropDetail,
	ResCropList
} from "@/api/interface/knowledge";

// * 获取作物列表
export const getCropsList = async (params: ReqCropList) =>
	http.get<ResCropList>("/knowledge/crop/list", params, { loading: false });

// * 获取作物详情
export const getCropDetail = async (cropId: number) =>
	http.get<ResCropDetail>(`/knowledge/crop/${cropId}`, {}, { loading: false });

// * 创建作物
export const createCrop = (params: ReqCreateCrop) =>
	http.post<null>("/knowledge/crop", params, { loading: false });

// * 修改作物
export const updateCrop = (cropId: number, params: ReqUpdateCrop) =>
	http.patch(`/knowledge/crop/${cropId}`, params, { loading: false });

// * 删除作物
export const deleteCrop = (cropId: number) =>
	http.delete(`/knowledge/crop/${cropId}`, {}, { cancel: false });
