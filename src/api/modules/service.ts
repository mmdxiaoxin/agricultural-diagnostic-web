import http from "@/api";
import {
	ReqAddConfigs,
	ReqAiServiceList,
	ReqCreateAiService,
	ReqUpdateAiService,
	ResAiService,
	ResAiServiceList
} from "@/api/interface/service";

export const getServiceList = (params: ReqAiServiceList) => {
	return http.get<ResAiServiceList>("/ai-service/list", params, { loading: false });
};

export const getService = (serviceId: number) => {
	return http.get<ResAiService>(`/ai-service/${serviceId}`, { loading: false });
};

export const createService = (data: ReqCreateAiService) => {
	return http.post<null>("/ai-service", data, { loading: false });
};

export const updateService = (serviceId: number, data: ReqUpdateAiService) => {
	return http.put<null>(`/ai-service/${serviceId}`, data, { loading: false });
};

export const deleteService = (serviceId: number) => {
	return http.delete(`/ai-service/${serviceId}`);
};

export const addConfigs = (serviceId: number, data: ReqAddConfigs) => {
	return http.post(`/ai-service/${serviceId}/configs`, data);
};
