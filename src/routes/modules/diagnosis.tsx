import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const diagnosisRoutes: RouteObjectEx[] = [
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
		path: "/diagnosis/setting",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/DiagnosisSetting"))),
		meta: {
			requiresAuth: true,
			title: "诊断设置",
			key: "diagnosis-setting"
		}
	},
	{
		path: "/diagnosis/history",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/DiagnosisHistory"))),
		meta: {
			requiresAuth: true,
			title: "诊断历史",
			key: "diagnosis-history"
		}
	}
];

export default diagnosisRoutes;
