import { ApiResponse } from ".";

export interface ReqDiagnoseDisease {
	fileId: string;
}

export type ResDiagnoseDisease = ApiResponse<{
	[propName: string]: any;
}>;
