import http from "@/api";
import { ReqLogin, ResAuthButtons, ResLogin } from "../interface";

/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: ReqLogin) => {
	return http.post<ResLogin>(`/auth/login`, {
		...params
	});
};

// * 获取按钮权限
export const getAuthorButtons = () => {
	return http.get<ResAuthButtons>(`/auth/buttons`);
};

// * 获取菜单列表
export const getMenuList = () => {
	return http.get<Menu.MenuOptions[]>(`/auth/route`);
};
