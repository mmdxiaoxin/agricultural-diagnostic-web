import { ResAuthDict } from "../interface";
import http from "@/api";

// * 获取角色字典
export const getRoleDict = () => http.get<ResAuthDict>(`/role/dict`, {}, { loading: false });
