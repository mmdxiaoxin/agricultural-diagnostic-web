import http from "@/api";

// * 病害数据诊断
export const diagnoseDisease = async (fileId: string) => http.get<any>(`/diagnosis/${fileId}`);
