import http from "@/api";
import {
	ReqDiagnosisHistoryList,
	ReqStartDiagnoseDisease,
	ResDiagnosisHistoryList,
	ResStartDiagnoseDisease,
	ResUploadDiagnosisImage
} from "../interface/diagnosis";

// * 上传诊断图片
export const uploadDiagnosisImage = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return http.post<ResUploadDiagnosisImage>("/diagnosis/upload", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// * 开始诊断
export const startDiagnosis = async (params: ReqStartDiagnoseDisease) => {
	const { diagnosisId, ...data } = params;
	return http.post<ResStartDiagnoseDisease>(`/diagnosis/${diagnosisId}/start`, data, {
		loading: false
	});
};

// * 获取诊断状态
export const getDiagnosisStatus = async (id: number) => {
	return http.get<any>(`/diagnosis/${id}/status`);
};

// * 获取诊断历史
export const getDiagnosisHistory = async () => {
	return http.get<any>("/diagnosis/history");
};

// * 获取诊断支持信息
export const getDiagnosisSupport = async () => {
	return http.get<any>("/diagnosis/support");
};

// * 获取诊断历史列表
export const getDiagnosisHistoryList = async (params: ReqDiagnosisHistoryList) => {
	return http.get<ResDiagnosisHistoryList>("/diagnosis/history/list", params, { loading: false });
};
