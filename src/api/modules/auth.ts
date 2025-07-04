import http from "@/api";
import { ReqLogin, ReqRegister, ResAuthButtons, ResLogin } from "../interface";

// * 用户登录接口
export const loginApi = (params: ReqLogin) =>
	http.post<ResLogin>(`/api/auth/login`, {
		...params
	});

// * 用户注册接口
export const registerApi = (params: ReqRegister) =>
	http.post<null>(`/api/auth/register`, {
		...params
	});

// * 获取按钮权限
export const getAuthorButtons = () => http.get<ResAuthButtons>(`/api/auth/buttons`);
