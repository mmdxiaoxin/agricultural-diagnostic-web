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
