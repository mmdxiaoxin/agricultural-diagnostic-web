import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const serviceRoutes: RouteObjectEx[] = [
	{
		path: "/service/manage",
		element: lazyLoad(React.lazy(() => import("@/views/service/ServiceManage"))),
		meta: {
			requiresAuth: true,
			title: "服务管理",
			key: "service-manage"
		}
	},
	{
		path: "/service/config",
		element: lazyLoad(React.lazy(() => import("@/views/service/ServiceConfig"))),
		meta: {
			requiresAuth: true,
			title: "服务配置",
			key: "service-config"
		}
	}
];

export default serviceRoutes;
