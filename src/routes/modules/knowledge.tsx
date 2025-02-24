import { LayoutIndex } from "@/routes/constant";
import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const knowledgeRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "病害知识库"
		},
		children: [
			{
				path: "/knowledge/manage",
				element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgeManage"))),
				meta: {
					requiresAuth: true,
					title: "知识库管理",
					key: "manage"
				}
			}
		]
	}
];

export default knowledgeRouter;
