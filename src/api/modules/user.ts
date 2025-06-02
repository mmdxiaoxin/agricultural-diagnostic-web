import http from "@/api";
import {
	ResUserDetail,
	ResUserList,
	ResUserProfile,
	UserCreateParams,
	UserListParams,
	UserProfileParams,
	UserUpdateParams
} from "../interface";

export const getUserList = (data: UserListParams) =>
	http.get<ResUserList>("/api/user/list", data, { loading: false });

export const getUserProfile = () =>
	http.get<ResUserProfile>("/api/user/profile", {}, { loading: false });

export const getAvatar = (): Promise<Blob> =>
	http.get(
		`/api/user/avatar`,
		{},
		{ loading: false, responseType: "blob" }
	) as unknown as Promise<Blob>;

export const uploadAvatar = (data: FormData) =>
	http.post<null>("/api/user/avatar", data, { loading: false });

export const updateUserProfile = (data: UserProfileParams) =>
	http.put<null>("/api/user/profile", data);

export const resetUserPassword = (data: { confirmPassword: string }) =>
	http.put<null>("/api/user/reset/password", data, { loading: false });

export const createUser = (data: UserCreateParams) => http.post<null>("/api/user/create", data);

export const getUserById = (id: number | string) =>
	http.get<ResUserDetail>(`/api/user/${id}`, {}, { loading: false });

export const updateUserById = (id: number | string, data: UserUpdateParams) =>
	http.put<null>(`/api/user/${id}`, data, { loading: false });

export const updateUserStatus = (id: number | string, status: number) =>
	http.put<null>(`/api/user/${id}/status`, { status }, { loading: false });

export const deleteUserById = (id: number | string) => http.delete<null>(`/api/user/${id}`);

export const resetUserById = (id: number | string) =>
	http.put<null>(`/api/user/${id}/reset/password`);
