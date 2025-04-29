import http from "@/api";
import { PageData, ReqPage } from "../interface";
import {
	DiagnoseResult,
	DiagnosisLog,
	DiagnosisSupport,
	ReqDiagnosisHistoryList,
	ReqStartDiagnoseDisease,
	ResDiagnosisHistoryList,
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
	return http.post<DiagnoseResult>(`/diagnosis/${diagnosisId}/start`, data, {
		loading: false,
		timeout: 100000
	});
};

// * 开始诊断（异步）
export const startDiagnosisAsync = async (params: ReqStartDiagnoseDisease) => {
	const { diagnosisId, ...data } = params;
	return http.post<DiagnoseResult>(`/diagnosis/${diagnosisId}/start/async`, data, {
		loading: false
	});
};

// * 获取诊断状态
export const getDiagnosisStatus = async (id: number) => {
	return http.get<any>(`/diagnosis/${id}/status`, { loading: false });
};

// * 获取诊断日志
export const getDiagnosisLog = async (id: number) => {
	return http.get<DiagnosisLog>(`/diagnosis/${id}/log`, { loading: false });
};

// * 获取诊断日志列表
export const getDiagnosisLogList = async (id: number, params: ReqPage) => {
	return http.get<PageData<DiagnosisLog>>(`/diagnosis/${id}/log/list`, params, { loading: false });
};

// * 获取诊断支持信息
export const getDiagnosisSupport = async () => {
	return http.get<DiagnosisSupport[]>("/diagnosis/support", {}, { loading: false });
};

// * 获取诊断历史
export const getDiagnosisHistory = async () => {
	return http.get<any>("/diagnosis/history", {}, { loading: false });
};

// * 删除诊断历史
export const deleteDiagnosisHistory = async (id: number) => {
	return http.delete<null>(`/diagnosis/history/${id}`);
};

// * 批量删除诊断历史
export const deleteDiagnosisHistories = async (params: { diagnosisIds: string }) => {
	return http.delete<null>(`/diagnosis/history`, params);
};

// * 获取诊断历史列表
export const getDiagnosisHistoryList = async (params: ReqDiagnosisHistoryList) => {
	return http.get<ResDiagnosisHistoryList>("/diagnosis/history/list", params, { loading: false });
};
