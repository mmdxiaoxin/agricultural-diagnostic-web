import { LayoutIndex } from "@/routes/constant";
import lazyLoad from "@/routes/utils/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const captureRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "数据采集"
		},
		children: [
			{
				path: "/capture/dashboard",
				element: lazyLoad(React.lazy(() => import("@/views/capture/Dashboard"))),
				meta: {
					requiresAuth: true,
					title: "数据一览",
					key: "capture"
				}
			},
			{
				path: "/capture/manage",
				element: lazyLoad(React.lazy(() => import("@/views/capture/FileManage"))),
				meta: {
					requiresAuth: true,
					title: "数据管理",
					key: "manage"
				}
			},
			{
				path: "/capture/dataset",
				element: lazyLoad(React.lazy(() => import("@/views/capture/DatasetManage"))),
				meta: {
					requiresAuth: true,
					title: "数据集管理",
					key: "dataset"
				}
			}
		]
	}
];

export default captureRouter;
