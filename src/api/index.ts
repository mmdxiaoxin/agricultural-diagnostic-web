import NProgress from "@/config/nprogress";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/config/serviceLoading";
import { ResultEnum } from "@/enums/httpEnum";
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
import { AxiosCanceler } from "./helper/axiosCancel";
import { checkStatus } from "./helper/checkStatus";
import { ApiResponse } from "./interface";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	loading?: boolean;
	cancel?: boolean;
}
export type GetConfig = Omit<AxiosRequestConfig, "params"> & {
	loading?: boolean;
	cancel?: boolean;
};
export type PostConfig = AxiosRequestConfig & {
	loading?: boolean;
	cancel?: boolean;
};
export type PutConfig = AxiosRequestConfig & {
	loading?: boolean;
	cancel?: boolean;
};
export type DeleteConfig = Omit<AxiosRequestConfig, "params"> & {
	loading?: boolean;
	cancel?: boolean;
};
export type DownloadConfig = Omit<PostConfig, "responseType">;

const config = {
	baseURL: import.meta.env.VITE_API_URL as string,
	timeout: 10000,
	withCredentials: true
};

const axiosCanceler = new AxiosCanceler();

class RequestHttp {
	service: AxiosInstance;
	public constructor(config: AxiosRequestConfig) {
		// 实例化axios
		this.service = axios.create(config);

		this.service.interceptors.request.use(
			(config: CustomAxiosRequestConfig) => {
				NProgress.start();
				// 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
				config.cancel ??= true;
				config.cancel && axiosCanceler.addPending(config);

				// 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
				config.loading ??= true;
				config.loading && showFullScreenLoading();

				const token = store.getState().auth.token;
				if (config.headers && typeof config.headers.set === "function") {
					token && config.headers.set("Authorization", `Bearer ${token}`);
				}
				return config;
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			}
		);

		this.service.interceptors.response.use(
			(response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
				const { data, config } = response;
				NProgress.done();
				// * 在请求结束后，移除本次请求(关闭loading)
				axiosCanceler.removePending(config);
				config.loading && tryHideFullScreenLoading();

				// * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
				if (
					data.code &&
					data.code !== ResultEnum.SUCCESS &&
					data.code !== ResultEnum.CREATE_SUCCESS &&
					data.code !== ResultEnum.NO_CONTENT
				) {
					message.error(data.message || "请求失败！请您稍后重试");
					return Promise.reject(data);
				}

				// * 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
				return data;
			},
			async (error: AxiosError) => {
				const { response } = error;
				NProgress.done();
				tryHideFullScreenLoading();

				// 请求取消单独判断，不需要提示错误信息
				if (error.message === "canceled") {
					return Promise.reject(error);
				}
				// 请求超时单独判断，请求超时没有 response
				if (error.message.indexOf("timeout") !== -1) message.error("请求超时，请稍后再试");
				if (error.message.indexOf("Network Error") !== -1) message.error("网络错误！请您稍后重试");

				// 根据响应的错误状态码，做不同的处理
				if (response) {
					// 登录失效（status == 401）
					if (response.status == ResultEnum.UNAUTHORIZED) {
						store.dispatch(removeToken());
						message.error("登录失效，请重新登录");
						// 跳转到登录页面
						window.history.pushState({}, "", "/login");
						window.location.reload();
					}
					// @ts-ignore
					checkStatus(response.status, response?.data?.message);
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
	delete<T>(url: string, params?: any, _object: DeleteConfig = {}): Promise<ApiResponse<T>> {
		return this.service.delete(url, { params, ..._object });
	}
	download(url: string, params?: object, _object: DownloadConfig = {}): Promise<BlobPart> {
		return this.service.post(url, params, { ..._object, responseType: "blob" });
	}
}

export default new RequestHttp(config);
