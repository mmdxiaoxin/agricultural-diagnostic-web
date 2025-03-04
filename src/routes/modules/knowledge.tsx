import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const knowledgeRoutes: RouteObjectEx[] = [
	{
		path: "/knowledge/manage",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgeManage"))),
		meta: {
			requiresAuth: true,
			title: "知识库管理",
			key: "knowledge-manage"
		}
	},
	{
		path: "/knowledge/preview",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgePreview"))),
		meta: {
			requiresAuth: true,
			title: "知识库预览",
			key: "knowledge-preview"
		}
	}
];
export default knowledgeRoutes;
