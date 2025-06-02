import http from "@/api";
import {
	CreateRoleParams,
	ResAuthDict,
	RoleItem,
	RoleListParams,
	RoleListResponse,
	UpdateRoleParams
} from "../interface";

// * 获取角色字典
export const getRoleDict = () => http.get<ResAuthDict>(`/api/role/dict`, {}, { loading: false });

// * 获取角色列表
export const getRoleList = (params: RoleListParams) =>
	http.get<RoleListResponse>(`/api/role/list`, params);

// * 获取角色详情
export const getRoleById = (id: number) => http.get<RoleItem>(`/api/role/${id}`);

// * 创建角色
export const createRole = (params: CreateRoleParams) => http.post<RoleItem>(`/api/role`, params);

// * 更新角色
export const updateRole = (id: number, params: UpdateRoleParams) =>
	http.put<RoleItem>(`/api/role/${id}`, params);

// * 删除角色
export const deleteRoleById = (id: number) => http.delete(`/api/role/${id}`);
