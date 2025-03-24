import { ReqPage } from ".";

export type BBox = Array<{
	x: number;
	y: number;
	width: number;
	height: number;
}>;

export type ClassifyPrediction = {
	type: "classify";
	class_name: string;
	confidence: number;
};

export type DetectPrediction = {
	type: "detect";
	class_id: number;
	class_name: string;
	confidence: number;
	bbox: BBox;
};

export type Prediction = ClassifyPrediction | DetectPrediction;

export type DiagnosisHistory = {
	id: number;
	created_at: string;
	updated_at: string;
	diagnosisResult: ResStartDiagnoseDisease;
	status: string;
	createdBy: number;
	updatedBy: number;
};

export type ReqDiagnosisHistoryList = ReqPage;
export interface ReqStartDiagnoseDisease {
	diagnosisId: string | number;
	serviceId: number;
}
export type ResStartDiagnoseDisease = {
	predictions: Prediction[];
};
export type ResUploadDiagnosisImage = DiagnosisHistory;
