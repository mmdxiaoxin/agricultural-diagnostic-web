import http from "@/api";
import { ReqCreateDisease, ReqDiseaseList, ReqUpdateDisease } from "@/api/interface/knowledge";

// * 获取全部病害知识
export const getKnowledge = () => {
	return http.get("/knowledge", {}, { loading: false });
};

// * 获取病害知识列表
export const getKnowledgeList = (params: ReqDiseaseList) => {
	return http.get("/knowledge/list", { params }, { loading: false });
};

// * 获取病害知识详情
export const getKnowledgeDetail = (id: number | string) => {
	return http.get(`/knowledge/${id}`, {}, { loading: false });
};

// * 创建病害知识
export const createKnowledge = (data: ReqCreateDisease) => {
	return http.post("/knowledge", data, { loading: false });
};

// * 更新病害知识
export const updateKnowledge = (id: number | string, data: ReqUpdateDisease) => {
	return http.put(`/knowledge/${id}`, data, { loading: false });
};

// * 删除病害知识
export const deleteKnowledge = (id: number | string) => {
	return http.delete(`/knowledge/${id}`, {}, { loading: false });
};
