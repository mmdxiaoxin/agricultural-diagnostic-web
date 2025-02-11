import http from "@/api";
import { ResUserList, UserListParams } from "../interface";

export const getUserList = (params: UserListParams) =>
	http.get<ResUserList>("/user/list", params, { loading: false });
