import { PageData, ReqPage } from ".";

export interface AiService {
	serviceId: number; // 服务ID
	serviceName: string; // 服务名称
	serviceType: string; // 服务类型
	description: string; // 服务描述
	status: "active" | "inactive" | "under_maintenance"; // 服务状态
	endpointUrl: string; // 服务的访问URL
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
	aiServiceLogs: AiServiceLog[]; // 一对多关系
	aiServiceConfigs: AiServiceConfig[]; // 一对多关系
	aiServiceAccessLogs: AiServiceAccessLog[]; // 一对多关系
}

export interface AiServiceLog {
	logId: number; // 日志ID
	service: AiService; // 外键，关联AI服务表
	logType: "info" | "error" | "warning"; // 日志类型
	message: string; // 日志信息
	createdAt: string; // 日志生成时间
}

export interface AiServiceConfig {
	configId: number; // 配置ID
	service: AiService; // 外键，关联AI服务表
	configKey: string; // 配置项键名
	configValue: string; // 配置项值
	createdAt: string; // 创建时间
	updatedAt: string; // 更新时间
}

export interface AiServiceAccessLog {
	accessId: number; // 访问记录ID
	service: AiService; // 外键，关联AI服务表
	userId: number; // 用户ID（如果需要）
	accessTime: Date; // 访问时间
	responseTime: number; // 响应时间（毫秒）
	statusCode: number; // HTTP 状态码
}

export type ReqCreateAiService = Partial<
	Pick<AiService, "serviceName" | "serviceType" | "description" | "endpointUrl" | "status">
> & { serviceName: string };

export type ReqUpdateAiService = Partial<
	Pick<AiService, "serviceName" | "serviceType" | "description" | "endpointUrl" | "status">
>;

export type ReqAiServiceList = ReqPage & {};

export type ResAiServiceList = PageData<AiService>;
