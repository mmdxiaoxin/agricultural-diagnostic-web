import { ResAuthDict } from "./auth";

export interface RoleItem {
	id: number;
	name: string;
	alias: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoleParams {
	name: string;
	alias: string;
	description: string;
}

export interface UpdateRoleParams extends CreateRoleParams {}

export interface RoleListParams {
	page?: number;
	pageSize?: number;
	keyword?: string;
}

export interface RoleListResponse {
	list: RoleItem[];
	page: number;
	pageSize: number;
	total: number;
}

export type { ResAuthDict };
