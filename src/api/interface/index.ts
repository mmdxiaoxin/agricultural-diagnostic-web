export interface Result {
	code: number;
	msg: string;
}

// * 请求响应参数(包含data)
export interface ResultData<T = any> extends Result {
	data?: T;
}

export interface PageData<T = any> extends Result {
	data?: {
		list: T[];
		pagination: {
			page: number;
			pageSize: number;
			total: number;
		};
	};
}

export * from "./file";
export * from "./login";
