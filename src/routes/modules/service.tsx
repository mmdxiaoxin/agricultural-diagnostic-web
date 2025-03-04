import { LayoutIndex } from "@/routes/constant";
import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const serviceRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "诊断服务"
		},
		children: [
			{
				path: "/service/manage",
				element: lazyLoad(React.lazy(() => import("@/views/knowledge/KnowledgeManage"))),
				meta: {
					requiresAuth: true,
					title: "知识库管理",
					key: "knowledge-manage"
				}
			}
		]
	}
];

export default serviceRouter;
