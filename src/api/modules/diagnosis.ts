import http from "@/api";
import { PageData, ReqPage } from "../interface";
import {
	DiagnoseResult,
	DiagnosisFeedback,
	DiagnosisLog,
	DiagnosisSupport,
	ReqCreateDiagnosisFeedback,
	ReqDiagnosisHistoryList,
	ReqDiagnosisSupport,
	ReqStartDiagnoseDisease,
	ReqUpdateDiagnosisFeedback,
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

// * 获取诊断支持信息
export const getDiagnosisSupport = async () => {
	return http.get<DiagnosisSupport[]>("/diagnosis/support", {}, { loading: false });
};

// * 获取诊断支持信息详情
export const getDiagnosisSupportDetail = async (id: number | string) => {
	return http.get<DiagnosisSupport>(`/diagnosis/support/${id}`, {}, { loading: false });
};

// * 创建诊断支持
export const createDiagnosisSupport = async (params: ReqDiagnosisSupport) => {
	return http.post<DiagnosisSupport>("/diagnosis/support", params, { loading: false });
};

// * 更新诊断支持
export const updateDiagnosisSupport = async (id: number | string, params: ReqDiagnosisSupport) => {
	return http.put<DiagnosisSupport>(`/diagnosis/support/${id}`, params, { loading: false });
};

// * 删除诊断支持
export const deleteDiagnosisSupport = async (id: number | string) => {
	return http.delete<null>(`/diagnosis/support/${id}`);
};

// * 获取诊断反馈列表
export const getDiagnosisFeedbackList = async (params: ReqPage & { status?: string }) => {
	return http.get<PageData<DiagnosisFeedback>>("/diagnosis/feedback/list", params, {
		loading: false
	});
};

// * 获取诊断反馈列表(管理员、专家)
export const getDiagnosisFeedbackListForAdmin = async (params: ReqPage & { status?: string }) => {
	return http.get<PageData<DiagnosisFeedback>>("/diagnosis/feedback/list/all", params, {
		loading: false
	});
};

// * 获取诊断反馈详情
export const getDiagnosisFeedbackDetail = async (id: number | string) => {
	return http.get<DiagnosisFeedback>(`/diagnosis/feedback/${id}`, {}, { loading: false });
};

// * 创建诊断反馈
export const createDiagnosisFeedback = async (
	diagnosisId: number | string,
	params: ReqCreateDiagnosisFeedback
) => {
	return http.post<DiagnosisFeedback>(`/diagnosis/history/${diagnosisId}/feedback`, params, {
		loading: false
	});
};

// * 更新诊断反馈
export const updateDiagnosisFeedback = async (
	id: number | string,
	params: ReqUpdateDiagnosisFeedback
) => {
	return http.put<DiagnosisFeedback>(`/diagnosis/feedback/${id}`, params, { loading: false });
};

// * 删除诊断反馈
export const deleteDiagnosisFeedback = async (id: number | string) => {
	return http.delete<null>(`/diagnosis/feedback/${id}`);
};

// * 批量删除诊断反馈
export const deleteDiagnosisFeedbacks = async (params: { feedbackIds: string }) => {
	return http.delete<null>(`/diagnosis/feedback`, params);
};
