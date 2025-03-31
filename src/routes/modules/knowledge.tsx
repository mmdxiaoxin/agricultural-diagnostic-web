import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const knowledgeRoutes: RouteObjectEx[] = [
	{
		path: "/knowledge/disease",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/DiseaseManage"))),
		meta: {
			requiresAuth: true,
			title: "病害管理",
			key: "knowledge-disease"
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
	},
	{
		path: "/knowledge/external",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/ExternalSource"))),
		meta: {
			requiresAuth: true,
			title: "第三方知识库",
			key: "knowledge-external"
		}
	},
	{
		path: "/knowledge/crop",
		element: lazyLoad(React.lazy(() => import("@/views/knowledge/CropManage"))),
		meta: {
			requiresAuth: true,
			title: "作物管理",
			key: "knowledge-crop"
		}
	}
];
export default knowledgeRoutes;
