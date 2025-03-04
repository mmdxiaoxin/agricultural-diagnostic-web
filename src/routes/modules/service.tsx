import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const serviceRoutes: RouteObjectEx[] = [
	{
		path: "/service/manage",
		element: lazyLoad(React.lazy(() => import("@/views/service/ServiceManage"))),
		meta: {
			requiresAuth: true,
			title: "知识库管理",
			key: "knowledge-manage"
		}
	}
];

export default serviceRoutes;
