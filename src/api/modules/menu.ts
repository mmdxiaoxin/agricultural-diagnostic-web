import http from "@/api";
import {
	ReqConfigureMenuRoles,
	ReqCreateMenuItem,
	ReqUpdateMenuItem,
	ResMenuDetail,
	ResMenuList
} from "../interface";

// * 获取权限路由
export const getAuthRoutes = () => http.get<Menu.MenuOptions[]>(`/menu/routes`);

// * 获取菜单列表
export const getMenuList = () => http.get<ResMenuList>(`/menu`);

// * 获取菜单详情
export const getMenuDetail = (id: number) => http.get<ResMenuDetail>(`/menu/${id}`);

// * 添加菜单
export const createMenu = (data: ReqCreateMenuItem) => http.post(`/menu`, data);

// * 删除菜单
export const deleteMenu = (id: number) => http.delete(`/menu/${id}`);

// * 更新菜单
export const updateMenu = (id: number, data: ReqUpdateMenuItem) => http.put(`/menu/${id}`, data);

// * 配置菜单角色关联
export const configureMenuRoles = (data: ReqConfigureMenuRoles) =>
	http.post(`/menu/configure-roles`, data);
