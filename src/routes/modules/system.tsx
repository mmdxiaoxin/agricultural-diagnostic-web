import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const systemRouter: RouteObjectEx[] = [
	{
		path: "/system/index",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgeManage"))),
		meta: {
			requiresAuth: true,
			title: "系统配置",
			key: "system-index"
		}
	}
];

export default systemRouter;
