export interface BaseResponse {
	code: number;
	message: string;
}

// * 请求响应参数(包含data)
export interface ApiResponse<T = any> extends BaseResponse {
	data?: T;
}

export interface ListData<T = any> {
	list: T[];
}

export interface PageData<T = any> {
	list: T[];
	page: number;
	pageSize: number;
	total: number;
}

export type ReqPage = {
	page: number;
	pageSize: number;
};

export * from "./file";
export * from "./auth";
export * from "./diagnosis";
export * from "./user";
export * from "./dataset";
export * from "./service";
export * from "./menu";
