export interface DictItem {
	key: number;
	value: string;
}

export interface ReqLogin {
	login: string;
	password: string;
}

export interface ReqRegister {
	email: string;
	password: string;
}

export type ResLogin = {
	access_token: string;
};

export type ResAuthButtons = {
	[propName: string]: any;
};

export type ResAuthDict = Array<DictItem>;
