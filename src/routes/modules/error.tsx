import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

// 错误页面模块
const errorRoutes: RouteObjectEx[] = [
	{
		path: "/403",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/403"))),
		meta: {
			requiresAuth: true,
			title: "403页面",
			key: "403"
		}
	},
	{
		path: "/404",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/404"))),
		meta: {
			requiresAuth: false,
			title: "404页面",
			key: "404"
		}
	},
	{
		path: "/500",
		element: lazyLoad(React.lazy(() => import("@/components/ErrorMessage/500"))),
		meta: {
			requiresAuth: false,
			title: "500页面",
			key: "500"
		}
	}
];

export default errorRoutes;
