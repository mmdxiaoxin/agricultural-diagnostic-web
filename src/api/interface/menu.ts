export interface MenuItem {
	id: number;
	icon: string;
	title: string;
	path: string;
	sort: number;
	parentId: number;
	isLink: string | null;
	parent: MenuItem | null;
	children?: MenuItem[];
}

export type ResMenuList = MenuItem[];

export type ResMenuDetail = MenuItem;

export type ReqCreateMenuItem = Omit<MenuItem, "id" | "parent">;

export type ReqUpdateMenuItem = Partial<ReqCreateMenuItem>;
