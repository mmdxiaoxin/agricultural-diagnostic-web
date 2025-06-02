import http from "@/api";
import {
	Crop,
	ReqCreateCrop,
	ReqCropList,
	ReqUpdateCrop,
	ResCropDetail,
	ResCropList
} from "@/api/interface/knowledge";

// * 获取全部作物
export const getCrops = async () => http.get<Crop[]>("/api/knowledge/crop", {}, { loading: false });

// * 获取作物列表
export const getCropsList = async (params: ReqCropList) =>
	http.get<ResCropList>("/api/knowledge/crop/list", params, { loading: false });

// * 获取作物详情
export const getCropDetail = async (cropId: number) =>
	http.get<ResCropDetail>(`/api/knowledge/crop/${cropId}`, {}, { loading: false });

// * 创建作物
export const createCrop = (params: ReqCreateCrop) =>
	http.post<null>("/api/knowledge/crop", params, { loading: false });

// * 修改作物
export const updateCrop = (cropId: number, params: ReqUpdateCrop) =>
	http.patch(`/api/knowledge/crop/${cropId}`, params, { loading: false });

// * 删除作物
export const deleteCrop = (cropId: number) => http.delete(`/api/knowledge/crop/${cropId}`);
