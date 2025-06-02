import http from "@/api";
import { PageData } from "@/api/interface";
import {
	Disease,
	ReqCreateDisease,
	ReqDiseaseList,
	ReqUpdateDisease
} from "@/api/interface/knowledge";

// * 获取全部病害知识
export const getKnowledge = () => {
	return http.get<Disease[]>("/api/knowledge", {}, { loading: false });
};

// * 获取病害知识列表
export const getKnowledgeList = (params: ReqDiseaseList) => {
	return http.get<PageData<Disease>>("/api/knowledge/list", params, { loading: false });
};

// * 创建病害知识
export const createKnowledge = (data: ReqCreateDisease) => {
	return http.post<Disease>("/api/knowledge", data, { loading: false });
};

// * 更新病害知识
export const updateKnowledge = (id: number | string, data: ReqUpdateDisease) => {
	return http.put<Disease>(`/api/knowledge/${id}`, data, { loading: false });
};

// * 删除病害知识
export const deleteKnowledge = (id: number | string) => {
	return http.delete<null>(`/api/knowledge/${id}`, {}, { loading: false });
};
