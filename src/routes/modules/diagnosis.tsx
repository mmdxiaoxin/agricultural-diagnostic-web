import { LayoutIndex } from "@/routes/constant";
import lazyLoad from "@/routes/utils/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const diagnosisRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "病害诊断"
		},
		children: [
			{
				path: "/diagnosis/image",
				element: lazyLoad(React.lazy(() => import("@/views/diagnosis/ImageDiagnosis"))),
				meta: {
					requiresAuth: true,
					title: "病害图片分析",
					key: "image"
				}
			},
			{
				path: "/diagnosis/models",
				element: lazyLoad(React.lazy(() => import("@/views/diagnosis/ModelsManage"))),
				meta: {
					requiresAuth: true,
					title: "模型管理",
					key: "models"
				}
			}
		]
	}
];

export default diagnosisRouter;
