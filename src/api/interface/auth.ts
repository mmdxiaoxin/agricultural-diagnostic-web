export interface ReqLogin {
	username: string;
	password: string;
}

export type ResLogin = {
	token: string;
};
export type ResAuthButtons = {
	[propName: string]: any;
};
