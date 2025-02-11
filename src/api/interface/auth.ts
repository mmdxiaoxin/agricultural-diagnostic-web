import { ApiResponse } from ".";

export namespace Login {
	export interface ReqLogin {
		username: string;
		password: string;
	}

	export type ResLogin = ApiResponse<{
		token: string;
	}>;

	export type ResAuthButtons = ApiResponse<{
		[propName: string]: any;
	}>;
}
