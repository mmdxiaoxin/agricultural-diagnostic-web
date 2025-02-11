export interface DictItem {
	key: number;
	value: string;
}

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

export type ResAuthDict = Array<DictItem>;
