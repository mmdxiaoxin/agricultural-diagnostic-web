import { PageData, ReqPage } from ".";

export interface RemoteService {
	id: number; // 服务ID
	serviceName: string; // 服务名称
	serviceType: string; // 服务类型
	description: string; // 服务描述
	status: "active" | "inactive" | "under_maintenance"; // 服务状态
	configs: RemoteConfig[]; // 服务配置
	interfaces: RemoteInterface[];
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export interface RemoteConfig {
	id: number; // 配置ID
	name: string; // 配置名称
	description: string; // 配置描述
	status: "active" | "inactive"; // 配置状态
	config: object; // 配置内容
	serviceId: number; // 服务ID
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export interface RemoteInterface {
	id: number; // 服务ID
	name: string; // 服务名称
	type: string; // 服务类型
	description: string; // 服务描述
	url: string; // 服务地址
	config: object; // 服务配置
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export type ReqCreateRemoteService = ReqUpdateRemoteService & { serviceName: string };

export type ReqUpdateRemoteService = Partial<
	Pick<RemoteService, "serviceName" | "serviceType" | "description" | "configs" | "status">
>;

export type ReqRemoteServiceList = ReqPage & {};

export type ResRemoteService = RemoteService[];

export type ResRemoteServiceList = PageData<RemoteService>;

export type ResRemoteServiceDetail = RemoteService;

export type ReqCreateRemoteInterface = ReqUpdateRemoteInterface & { name: string };

export type ReqUpdateRemoteInterface = Partial<
	Pick<RemoteInterface, "name" | "type" | "description" | "config" | "url">
>;

export type ReqRemoteInterfaceList = ReqPage & {};

export type ResRemoteInterface = RemoteInterface[];

export type ResRemoteInterfaceList = PageData<RemoteInterface>;

export type ResRemoteInterfaceDetail = RemoteInterface;
