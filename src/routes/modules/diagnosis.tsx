import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const diagnosisRoutes: RouteObjectEx[] = [
	{
		path: "/diagnosis/image",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/DiagnosisImage"))),
		meta: {
			requiresAuth: true,
			title: "病害诊断",
			key: "diagnosis-image"
		}
	},
	{
		path: "/diagnosis/test",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/DiagnosisTest"))),
		meta: {
			requiresAuth: true,
			title: "诊断测试",
			key: "diagnosis-test"
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
	},
	{
		path: "/diagnosis/feedback",
		element: lazyLoad(React.lazy(() => import("@/views/diagnosis/FeedbackHistory"))),
		meta: {
			requiresAuth: true,
			title: "反馈历史",
			key: "diagnosis-feedback"
		}
	}
];

export default diagnosisRoutes;
