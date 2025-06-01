import NProgress from "@/config/nprogress";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/config/serviceLoading";
import { ResultEnum } from "@/enums/http.enum";
import { store } from "@/store/index"; // 导入 store
import { removeToken } from "@/store/modules/authSlice";
import { message } from "antd";
import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig
} from "axios";
import { checkStatus } from "./helper/checkStatus";
import { ApiResponse } from "./interface";
import { apiCache } from "@/utils/indexDB/apiCache";

export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
	loading?: boolean;
	toast?: boolean;
	noCache?: boolean;
	retryCount?: number;
}
export interface CustomAxiosError extends AxiosError {
	config: CustomInternalAxiosRequestConfig;
	__CACHE_HIT__?: boolean;
	data?: any;
}
export type GetConfig = Omit<AxiosRequestConfig, "params"> & {
	loading?: boolean;
	toast?: boolean;
};
export type PostConfig = AxiosRequestConfig & {
	loading?: boolean;
	toast?: boolean;
};
export type PutConfig = AxiosRequestConfig & {
	loading?: boolean;
	toast?: boolean;
};
export type DeleteConfig = Omit<AxiosRequestConfig, "params"> & {
	loading?: boolean;
	toast?: boolean;
};
export type DownloadConfig = Omit<PostConfig, "responseType">;

const config = {
	baseURL:
		import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}/api`,
	timeout: 10000,
	withCredentials: true,
	toast: true
};

class RequestHttp {
	service: AxiosInstance;
	private retryCount: number = 3; // 重试次数
	private retryDelay: number = 1000; // 重试延迟（毫秒）

	public constructor(config: AxiosRequestConfig) {
		// 实例化axios
		this.service = axios.create(config);

		this.service.interceptors.request.use(
			async (config: CustomInternalAxiosRequestConfig) => {
				NProgress.start();

				// 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
				config.loading ??= true;
				config.loading && showFullScreenLoading();

				const token = store.getState().auth.token;
				if (config.headers && typeof config.headers.set === "function") {
					token && config.headers.set("Authorization", `Bearer ${token}`);
				}

				// 尝试从缓存获取数据
				if (config.method?.toLowerCase() === "get" && !config.noCache) {
					const cachedData = await apiCache.getCache(
						config.url || "",
						config.method,
						config.params
					);
					if (cachedData) {
						NProgress.done();
						config.loading && tryHideFullScreenLoading();
						return Promise.reject({
							__CACHE_HIT__: true,
							data: cachedData
						} as CustomAxiosError);
					}
				}

				return config;
			},
			(error: AxiosError) => {
				NProgress.done();
				tryHideFullScreenLoading();
				return Promise.reject(error);
			}
		);

		this.service.interceptors.response.use(
			async (response: AxiosResponse & { config: CustomInternalAxiosRequestConfig }) => {
				const { data, config } = response;
				NProgress.done();
				config.loading && tryHideFullScreenLoading();

				// 缓存成功的响应
				if (config.method?.toLowerCase() === "get" && !config.noCache) {
					await apiCache.setCache(config.url || "", config.method, data, config.params);
				}

				// * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
				if (
					data.code &&
					data.code !== ResultEnum.SUCCESS &&
					data.code !== ResultEnum.CREATE_SUCCESS &&
					data.code !== ResultEnum.NO_CONTENT
				) {
					config.toast && message.error(data.message || "请求失败！请您稍后重试");
					return Promise.reject(data);
				}

				// * 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
				return data;
			},
			async (error: CustomAxiosError) => {
				// 处理缓存命中
				if (error.__CACHE_HIT__) {
					return error.data;
				}

				const { response, config } = error;
				NProgress.done();
				tryHideFullScreenLoading();

				// 请求超时或网络错误时尝试重试
				if (
					(error.message.indexOf("timeout") !== -1 ||
						error.message.indexOf("Network Error") !== -1) &&
					config.retryCount !== 0
				) {
					config.retryCount = (config.retryCount || this.retryCount) - 1;

					// 延迟重试
					await new Promise(resolve => setTimeout(resolve, this.retryDelay));
					return this.service(config);
				}

				if (error.message.indexOf("timeout") !== -1) {
					message.error("请求超时，请稍后再试");
				}
				if (error.message.indexOf("Network Error") !== -1) {
					message.error("网络错误！请您稍后重试");
				}

				if (response) {
					// 登录失效（status == 401）
					if (response.status == ResultEnum.UNAUTHORIZED) {
						store.dispatch(removeToken());
						error.config.toast && message.error("登录失效，请重新登录");
						// 跳转到登录页面
						window.history.pushState({}, "", "/login");
						window.location.reload();
					}
					// @ts-ignore
					error.config.toast && checkStatus(response.status, response?.data?.message);
				}

				// 服务器结果都没有返回(可能服务器错误可能客户端断网) 断网处理:可以跳转到断网页面
				if (!window.navigator.onLine) {
					window.history.pushState({}, "", "/500");
					window.location.reload();
				}
				return Promise.reject(error);
			}
		);
	}

	// * 常用请求方法封装
	get<T>(url: string, params?: object, _object: GetConfig = {}): Promise<ApiResponse<T>> {
		return this.service.get(url, { params, ..._object });
	}
	post<T>(url: string, data?: object, _object: PostConfig = {}): Promise<ApiResponse<T>> {
		return this.service.post(url, data, _object);
	}
	put<T>(url: string, data?: object, _object: PutConfig = {}): Promise<ApiResponse<T>> {
		return this.service.put(url, data, _object);
	}
	patch<T>(url: string, data?: object, _object: PutConfig = {}): Promise<ApiResponse<T>> {
		return this.service.patch(url, data, _object);
	}
	delete<T>(url: string, params?: any, _object: DeleteConfig = {}): Promise<ApiResponse<T>> {
		return this.service.delete(url, { params, ..._object });
	}
	get_blob(url: string, params?: object, _object: DownloadConfig = {}): Promise<BlobPart> {
		return this.service.get(url, { params, ..._object, responseType: "blob" });
	}
	post_blob(url: string, params?: object, _object: DownloadConfig = {}): Promise<BlobPart> {
		return this.service.post(url, params, { ..._object, responseType: "blob" });
	}
}

export default new RequestHttp(config);
