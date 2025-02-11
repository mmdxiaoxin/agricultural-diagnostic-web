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
	pagination: {
		page: number;
		pageSize: number;
		total: number;
	};
}

export * from "./file";
export * from "./auth";
