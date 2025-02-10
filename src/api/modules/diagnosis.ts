import http from "@/api";

// 病害数据诊断
export const diagnoseDisease = async (fileId: string) => {
	return http.get<any>(`/diagnosis/${fileId}`);
};
