import http from "@/api";
import {
	ReqAddConfigs,
	ReqAiServiceList,
	ReqCreateAiService,
	ReqUpdateAiService,
	ReqUpdateConfigs,
	ResAiService,
	ResAiServiceDetail,
	ResAiServiceList
} from "@/api/interface/service";

export const getServiceList = (params: ReqAiServiceList) => {
	return http.get<ResAiServiceList>("/ai-service/list", params, { loading: false });
};

export const getService = () => {
	return http.get<ResAiService>("/ai-service", {}, { loading: false });
};

export const getServiceDetail = (serviceId: number | string) => {
	return http.get<ResAiServiceDetail>(`/ai-service/${serviceId}`, {}, { loading: false });
};

export const createService = (data: ReqCreateAiService) => {
	return http.post<null>("/ai-service", data, { loading: false });
};

export const updateService = (serviceId: number, data: ReqUpdateAiService) => {
	return http.put<null>(`/ai-service/${serviceId}`, data, { loading: false });
};

export const deleteService = (serviceId: number) => {
	return http.delete(`/ai-service/${serviceId}`, {}, { loading: false });
};

export const addConfigs = (serviceId: number, data: ReqAddConfigs) => {
	return http.post(`/ai-service/${serviceId}/configs`, data, { loading: false });
};

export const updateConfigs = (serviceId: number, data: ReqUpdateConfigs) => {
	return http.put(`/ai-service/${serviceId}/configs`, data, { loading: false });
};

export const deleteConfig = (serviceId: number, configId: number) => {
	return http.delete(`/ai-service/${serviceId}/config/${configId}`, {}, { loading: false });
};

export const copyService = (serviceId: number) => {
	return http.post<ResAiServiceDetail>(`/ai-service/${serviceId}/copy`, {}, { loading: false });
};
