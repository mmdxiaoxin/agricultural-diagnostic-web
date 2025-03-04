import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const captureRoutes: RouteObjectEx[] = [
	{
		path: "/capture/dashboard",
		element: lazyLoad(React.lazy(() => import("@/views/capture/Dashboard"))),
		meta: {
			requiresAuth: true,
			title: "数据一览",
			key: "capture-dashboard"
		}
	},
	{
		path: "/capture/manage",
		element: lazyLoad(React.lazy(() => import("@/views/capture/FileManage"))),
		meta: {
			requiresAuth: true,
			title: "数据管理",
			key: "capture-manage"
		}
	},
	{
		path: "/capture/dataset",
		element: lazyLoad(React.lazy(() => import("@/views/capture/DatasetManage"))),
		meta: {
			requiresAuth: true,
			title: "数据集管理",
			key: "capture-dataset"
		}
	},
	{
		path: "/capture/dataset/edit/:id",
		element: lazyLoad(
			React.lazy(() => import("@/views/capture/DatasetDetail")),
			{ mode: "edit" }
		),
		meta: {
			title: "编辑数据集",
			key: "capture-dataset-edit"
		}
	},
	{
		path: "/capture/dataset/create",
		element: lazyLoad(
			React.lazy(() => import("@/views/capture/DatasetDetail")),
			{ mode: "create" }
		),
		meta: {
			title: "添加数据集",
			key: "capture-dataset-create"
		}
	}
];

export default captureRoutes;
