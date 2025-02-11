import { ApiResponse } from ".";

export namespace Diagnosis {
	export interface ReqDiagnoseDisease {
		fileId: string;
	}

	export type ResDiagnoseDisease = ApiResponse<{
		[propName: string]: any;
	}>;
}
