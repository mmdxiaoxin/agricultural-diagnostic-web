import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const diagnosisRouter: RouteObjectEx[] = [
	{
		path: "/diagnosis/image",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/ImageDiagnosis"))),
		meta: {
			requiresAuth: true,
			title: "病害图片分析",
			key: "diagnosis-image"
		}
	},
	{
		path: "/diagnosis/models",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/ModelsManage"))),
		meta: {
			requiresAuth: true,
			title: "模型管理",
			key: "diagnosis-models"
		}
	}
];

export default diagnosisRouter;
