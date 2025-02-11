import http from "@/api";
import { ResUserList, ResUserProfile, UserListParams, UserProfileParams } from "../interface";

export const getUserList = (params: UserListParams) =>
	http.get<ResUserList>("/user/list", params, { loading: false });

export const getUserProfile = () =>
	http.get<ResUserProfile>("/user/profile", {}, { loading: false });

export const updateUserProfile = (data: UserProfileParams) => http.put<null>("/user/profile", data);
