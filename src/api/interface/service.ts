import { PageData, ReqPage } from ".";

export interface RemoteService {
	id: number; // 服务ID
	serviceName: string; // 服务名称
	serviceType: string; // 服务类型
	description: string; // 服务描述
	status: "active" | "inactive" | "under_maintenance"; // 服务状态
	configs: object[]; // 服务配置
	interfaces: RemoteInterface[];
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export interface RemoteInterface {
	id: number; // 服务ID
	name: string; // 服务名称
	type: string; // 服务类型
	description: string; // 服务描述
	config: object; // 服务配置
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export type ReqCreateAiService = ReqUpdateAiService & { serviceName: string };

export type ReqUpdateAiService = Partial<
	Pick<RemoteService, "serviceName" | "serviceType" | "description" | "configs" | "status">
>;

export type ReqRemoteServiceList = ReqPage & {};

export type ResRemoteService = RemoteService[];

export type ResRemoteServiceList = PageData<RemoteService>;

export type ResRemoteServiceDetail = RemoteService;
