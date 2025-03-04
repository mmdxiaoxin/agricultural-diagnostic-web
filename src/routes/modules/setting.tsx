import lazyLoad from "@/routes/helper/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const systemRoutes: RouteObjectEx[] = [
	{
		path: "/setting/index",
		element: lazyLoad(React.lazy(() => import("@/views/system/index"))),
		meta: {
			requiresAuth: true,
			title: "系统配置",
			key: "system-index"
		}
	}
];

export default systemRoutes;
