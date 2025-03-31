import http from "@/api";
import { PageData, ReqPage } from "@/api/interface";
import { Disease, ReqCreateDisease, ReqUpdateDisease } from "@/api/interface/knowledge/disease";

// * 获取病害
export const getDisease = async () => {
	return http.get<Disease[]>("/knowledge/disease", {}, { loading: false });
};

// * 获取病害列表
export const getDiseaseList = async (params: ReqPage) => {
	return http.get<PageData<Disease>>("/knowledge/disease/list", params, { loading: false });
};

// * 获取病害详情
export const getDiseaseDetail = async (id: number) => {
	return http.get<Disease>(`/knowledge/disease/${id}`, {}, { loading: false });
};

// * 创建病害
export const createDisease = async (data: ReqCreateDisease) => {
	return http.post<Disease>("/knowledge/disease", data, { loading: false });
};

// * 更新病害
export const updateDisease = async (id: number, data: ReqUpdateDisease) => {
	return http.patch<Disease>(`/knowledge/disease/${id}`, data, { loading: false });
};

// * 删除病害
export const deleteDisease = async (id: number) => {
	return http.delete<Disease>(`/knowledge/disease/${id}`, { loading: false });
};
