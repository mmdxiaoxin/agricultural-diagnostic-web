import { PageData } from ".";

interface User {
	id: number;
	username: string;
	password: string;
	role_id: number;
	name?: string;
	phone?: string;
	address?: string;
	createdAt?: string;
	updatedAt?: string;
}

export type UserItem = Omit<User, "password">;

// * 用户列表参数
export type UserListParams = {
	page: number;
	pageSize: number;
} & Partial<UserItem>;
// * 用户列表响应
export type ResUserList = PageData<UserItem>;

// * 用户创建参数
export type UserCreateParams = Omit<User, "createdAt" | "updatedAt" | "id" | "password">;

// * 用户详情参数
export type UserProfileParams = Omit<ResUserProfile, "role_id" | "createdAt" | "username">;

// * 用户详情响应
export type ResUserProfile = Omit<User, "password" | "updatedAt" | "id">;

// * 用户修改参数
export type UserUpdateParams = Omit<ResUserProfile, "createdAt" | "username">;

// * 单个用户信息
export type ResUserDetail = UserItem;
