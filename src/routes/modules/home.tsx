import HomeIndex from "@/views/home/index";
import { RouteObjectEx } from "../interface";

// 首页模块
const homeRoutes: RouteObjectEx[] = [
	{
		path: "/home/index",
		element: <HomeIndex />,
		meta: {
			requiresAuth: true,
			title: "首页",
			key: "home"
		}
	}
];
export default homeRoutes;
