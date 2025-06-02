import http from "@/api";
import {
	RemoteConfig,
	ReqCreateRemoteInterface,
	ReqCreateRemoteService,
	ReqRemoteInterfaceList,
	ReqRemoteServiceList,
	ReqUpdateRemoteService,
	ResRemoteInterfaceDetail,
	ResRemoteInterfaceList,
	ResRemoteService,
	ResRemoteServiceDetail,
	ResRemoteServiceList
} from "@/api/interface/service";
import { PageData } from "../interface";
import { ReqUpdateRemoteInterface } from "./../interface/service";

export const getRemotesList = (params: ReqRemoteServiceList) => {
	return http.get<ResRemoteServiceList>("/api/remote/list", params, { loading: false });
};

export const getRemotes = () => {
	return http.get<ResRemoteService>("/api/remote", {}, { loading: false });
};

export const getRemote = (serviceId: number | string) => {
	return http.get<ResRemoteServiceDetail>(`/api/remote/${serviceId}`, {}, { loading: false });
};

export const createRemote = (data: ReqCreateRemoteService) => {
	return http.post<null>("/api/remote", data, { loading: false });
};

export const copyRemote = (serviceId: number) => {
	return http.post<ResRemoteServiceDetail>(`/api/remote/${serviceId}/copy`, {}, { loading: false });
};

export const updateRemote = (serviceId: number, data: ReqUpdateRemoteService) => {
	return http.put<null>(`/api/remote/${serviceId}`, data, { loading: false });
};

export const remoteRemote = (serviceId: number) => {
	return http.delete(`/api/remote/${serviceId}`, {}, { loading: false });
};

export const getRemoteInterfaces = (serviceId: number, params: ReqRemoteInterfaceList) => {
	return http.get<ResRemoteInterfaceList>(`/api/remote/${serviceId}/interface`, params, {
		loading: false
	});
};

export const getRemoteInterface = (serviceId: number, interfaceId: number) => {
	return http.get<ResRemoteInterfaceDetail>(
		`/api/remote/${serviceId}/interface/${interfaceId}`,
		{},
		{ loading: false }
	);
};

export const createRemoteInterface = (serviceId: number, data: ReqCreateRemoteInterface) => {
	return http.post(`/api/remote/${serviceId}/interface`, data, { loading: false });
};

export const copyRemoteInterface = (serviceId: number, interfaceId: number) => {
	return http.post<ResRemoteInterfaceDetail>(
		`/api/remote/${serviceId}/interface/${interfaceId}/copy`,
		{},
		{ loading: false }
	);
};

export const callRemoteInterface = <T = any>(
	serviceId: number,
	interfaceId: number,
	data?: { params?: any; data?: any }
) => {
	return http.post<T>(`/api/remote/${serviceId}/interface/${interfaceId}/call`, data, {
		loading: false
	});
};

export const updateRemoteInterface = (
	serviceId: number,
	interfaceId: number,
	data: ReqUpdateRemoteInterface
) => {
	return http.put(`/api/remote/${serviceId}/interface/${interfaceId}`, data, { loading: false });
};

export const removeRemoteInterface = (serviceId: number, interfaceId: number) => {
	return http.delete(`/api/remote/${serviceId}/interface/${interfaceId}`, {}, { loading: false });
};

// 配置相关接口
export const getRemoteConfigs = (serviceId: number) => {
	return http.get<RemoteConfig[]>(`/api/remote/${serviceId}/config`, {}, { loading: false });
};

export const getRemoteConfigList = (serviceId: number, page: number, pageSize: number) => {
	return http.get<PageData<RemoteConfig>>(
		`/api/remote/${serviceId}/config/list`,
		{ page, pageSize },
		{ loading: false }
	);
};

export const getRemoteConfigById = (serviceId: number, configId: number) => {
	return http.get<RemoteConfig>(
		`/api/remote/${serviceId}/config/${configId}`,
		{},
		{ loading: false }
	);
};

export const createRemoteConfig = (serviceId: number, data: Partial<RemoteConfig>) => {
	return http.post<RemoteConfig>(`/api/remote/${serviceId}/config`, data, { loading: false });
};

export const copyRemoteConfig = (serviceId: number, configId: number) => {
	return http.post<RemoteConfig>(
		`/api/remote/${serviceId}/config/${configId}/copy`,
		{},
		{ loading: false }
	);
};

export const updateRemoteConfig = (
	serviceId: number,
	configId: number,
	data: Partial<RemoteConfig>
) => {
	return http.put<RemoteConfig>(`/api/remote/${serviceId}/config/${configId}`, data, {
		loading: false
	});
};

export const removeRemoteConfig = (serviceId: number, configId: number) => {
	return http.delete(`/api/remote/${serviceId}/config/${configId}`, {}, { loading: false });
};
