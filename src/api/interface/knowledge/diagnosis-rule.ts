export type DiagnosisRule = {
	id: number;
	diseaseId: number;
	schema: string;
};

export type ReqDiagnosisRuleList = {
	page: number;
	pageSize: number;
	keyword: string;
};
