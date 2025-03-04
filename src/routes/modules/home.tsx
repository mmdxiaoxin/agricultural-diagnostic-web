import Home from "@/views/home/index";
import { RouteObjectEx } from "../interface";

// 首页模块
const homeRouter: RouteObjectEx[] = [
	{
		path: "/home/index",
		element: <Home />,
		meta: {
			requiresAuth: true,
			title: "首页",
			key: "home"
		}
	}
];
export default homeRouter;
