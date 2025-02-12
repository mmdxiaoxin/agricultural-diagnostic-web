import { RouteObject } from "react-router";

export interface MetaProps {
	keepAlive?: boolean;
	requiresAuth?: boolean;
	title: string;
	key?: string;
}

export type RouteObjectEx = RouteObject & {
	caseSensitive?: boolean;
	children?: RouteObjectEx[];
	element?: React.ReactNode;
	index?: boolean;
	path?: string;
	meta?: MetaProps;
	isLink?: string;
};
