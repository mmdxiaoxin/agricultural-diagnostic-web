import http from "@/api";
import {
	ReqConfigureMenuRoles,
	ReqCreateMenuItem,
	ReqUpdateMenuItem,
	ResMenuDetail,
	ResMenuList
} from "../interface";

// * 获取权限路由
export const getAuthRoutes = () => http.get<Menu.MenuOptions[]>(`/api/menu/routes`);

// * 获取菜单列表
export const getMenuList = () => http.get<ResMenuList>(`/api/menu`);

// * 获取菜单详情
export const getMenuDetail = (id: number) => http.get<ResMenuDetail>(`/api/menu/${id}`);

// * 添加菜单
export const createMenu = (data: ReqCreateMenuItem) => http.post(`/api/menu`, data);

// * 删除菜单
export const deleteMenu = (id: number) => http.delete(`/api/menu/${id}`);

// * 更新菜单
export const updateMenu = (id: number, data: ReqUpdateMenuItem) =>
	http.put(`/api/menu/${id}`, data);

// * 配置菜单角色关联
export const configureMenuRoles = (data: ReqConfigureMenuRoles) =>
	http.post(`/api/menu/configure-menus`, data);

// * 获取角色下的菜单ID列表
export const getRoleMenuById = (roleId: number) => http.get<number[]>(`/api/menu/role/${roleId}`);
