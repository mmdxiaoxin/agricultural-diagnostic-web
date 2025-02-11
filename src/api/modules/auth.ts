import http from "@/api";
import { ReqLogin, ResAuthButtons, ResAuthDict, ResLogin } from "../interface";

// * 用户登录接口
export const loginApi = (params: ReqLogin) =>
	http.post<ResLogin>(`/auth/login`, {
		...params
	});

// * 获取按钮权限
export const getAuthorButtons = () => http.get<ResAuthButtons>(`/auth/buttons`);

// * 获取菜单列表
export const getMenuList = () => http.get<Menu.MenuOptions[]>(`/auth/route`);

// * 获取角色字典
export const getRoleDict = () => http.get<ResAuthDict>(`/auth/role-dict`);
