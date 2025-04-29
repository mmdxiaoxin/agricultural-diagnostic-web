import { LogLevel } from "@/enums";
import { PageData, ReqPage } from ".";
import { MatchResult } from "./knowledge";

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
	top5: BasePrediction[];
};

// 检测预测
export type DetectPrediction = BasePrediction & {
	type: "detect";
	bbox: BBox;
	area: number;
};

// 预测结果联合类型
export type Prediction = ClassifyPrediction | DetectPrediction;

// 诊断支持
export type DiagnosisSupport = {
	id: number;
	key: string;
	value: { serviceId: number; configId: number };
	description: string;
	createdAt: string;
	updatedAt: string;
};

// 诊断历史记录
export type DiagnosisHistory = {
	id: number;
	fileId: number;
	createdAt: string;
	updatedAt: string;
	diagnosisResult: DiagnoseResult;
	status: "pending" | "success" | "failed" | "processing";
	createdBy: number;
	updatedBy: number;
};

// 诊断日志
export type DiagnosisLog = {
	id: number;
	diagnosisId: number;
	diagnosis?: DiagnosisHistory;
	level: LogLevel;
	message: string;
	metadata: Record<string, any>;
	createdAt: string;
};

// 请求类型
export type ReqDiagnosisHistoryList = ReqPage;
export type ReqStartDiagnoseDisease = {
	diagnosisId: string | number;
	serviceId: number;
	configId: number;
};

// 响应类型
export type DiagnoseResult = {
	matchResults: MatchResult[];
	predictions?: Prediction[];
	status: "success" | "failed";
	task_id: string;
};
export type ResUploadDiagnosisImage = DiagnosisHistory;
export type ResDiagnosisHistoryList = PageData<DiagnosisHistory>;
