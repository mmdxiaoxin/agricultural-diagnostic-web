import { PageData } from ".";

export interface Role {
	id: number;
	name: string;
	alias: string | null;
	users: User[];
	createdAt: string;
	updatedAt: string;
}

export interface Profile {
	id: 2;
	gender: 0;
	avatar?: string;
	name?: string;
	phone?: string;
	address?: string;
}

export interface User {
	id: number;
	email?: string;
	username?: string;
	password?: string;
	status?: 0 | 1;
	roles?: Role[];
	profile?: Profile;
	createdAt?: string;
	updatedAt?: string;
}

export type UserAccount = Omit<User, "profile">;

export type UserItem = Omit<User, "password">;

// * 用户列表参数
export type UserListParams = {
	page: number;
	pageSize: number;
} & Partial<Profile> &
	Partial<UserItem>;
// * 用户列表响应
export type ResUserList = PageData<UserItem>;

// * 用户创建参数
export type UserCreateParams = Omit<User, "createdAt" | "updatedAt" | "id" | "password">;

// * 用户详情参数
export type UserProfileParams = Omit<ResUserProfile, "roles" | "createdAt" | "username">;

// * 用户详情响应
export type ResUserProfile = User & { roles: string[] };

// * 用户修改参数
export type UserUpdateParams = Omit<ResUserProfile, "createdAt">;

// * 单个用户信息
export type ResUserDetail = UserItem;
