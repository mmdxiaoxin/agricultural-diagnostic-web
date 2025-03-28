import http from "@/api";
import {
	ReqCreateRemoteInterface,
	ReqCreateRemoteService,
	ReqRemoteServiceList,
	ReqUpdateRemoteService,
	ResRemoteService,
	ResRemoteServiceDetail,
	ResRemoteServiceList
} from "@/api/interface/service";
import { ReqUpdateRemoteInterface } from "./../interface/service";

export const getRemotesList = (params: ReqRemoteServiceList) => {
	return http.get<ResRemoteServiceList>("/remote/list", params, { loading: false });
};

export const getRemotes = () => {
	return http.get<ResRemoteService>("/remote", {}, { loading: false });
};

export const getRemote = (serviceId: number | string) => {
	return http.get<ResRemoteServiceDetail>(`/remote/${serviceId}`, {}, { loading: false });
};

export const createRemote = (data: ReqCreateRemoteService) => {
	return http.post<null>("/remote", data, { loading: false });
};

export const copyRemote = (serviceId: number) => {
	return http.post<ResRemoteServiceDetail>(`/remote/${serviceId}/copy`, {}, { loading: false });
};

export const updateRemote = (serviceId: number, data: ReqUpdateRemoteService) => {
	return http.put<null>(`/remote/${serviceId}`, data, { loading: false });
};

export const remoteRemote = (serviceId: number) => {
	return http.delete(`/remote/${serviceId}`, {}, { loading: false });
};

export const createRemoteInterface = (serviceId: number, data: ReqCreateRemoteInterface) => {
	return http.post(`/remote/${serviceId}/interface`, data, { loading: false });
};

export const updateRemoteInterface = (
	serviceId: number,
	interfaceId: number,
	data: ReqUpdateRemoteInterface
) => {
	return http.put(`/remote/${serviceId}/interface/${interfaceId}`, data, { loading: false });
};

export const removeRemoteInterface = (serviceId: number, interfaceId: number) => {
	return http.delete(`/remote/${serviceId}/interface/${interfaceId}`, {}, { loading: false });
};
