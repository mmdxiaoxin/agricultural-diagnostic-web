import { AiService, PageData, ReqPage } from ".";

// 基础预测类型
export type BasePrediction = {
	class_id: number;
	class_name: string;
	confidence: number;
};

// 检测框类型
export type BBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

// 分类预测
export type ClassifyPrediction = BasePrediction & {
	type: "classify";
};

// 检测预测
export type DetectPrediction = BasePrediction & {
	type: "detect";
	bbox: BBox;
};

// 预测结果联合类型
export type Prediction = ClassifyPrediction | DetectPrediction;

// 诊断历史记录
export type DiagnosisHistory = {
	id: number;
	fileId: number;
	created_at: string;
	updated_at: string;
	diagnosisResult: ResStartDiagnoseDisease;
	status: string;
	createdBy: number;
	updatedBy: number;
};

// 请求类型
export type ReqDiagnosisHistoryList = ReqPage;
export type ReqStartDiagnoseDisease = {
	diagnosisId: string | number;
	serviceId: number;
};

// 响应类型
export type ResStartDiagnoseDisease = {
	predictions: Prediction[];
};
export type ResUploadDiagnosisImage = DiagnosisHistory;
export type ResDiagnosisHistoryList = PageData<DiagnosisHistory>;
export type ResDiagnosisSupport = AiService[];
