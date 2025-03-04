import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const serviceRouter: RouteObjectEx[] = [
	{
		path: "/service/manage",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgeManage"))),
		meta: {
			requiresAuth: true,
			title: "知识库管理",
			key: "knowledge-manage"
		}
	}
];

export default serviceRouter;
