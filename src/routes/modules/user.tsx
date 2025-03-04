import React from "react";
import lazyLoad from "../helper/lazyLoad";
import { RouteObjectEx } from "../interface";

const userRoutes: RouteObjectEx[] = [
	{
		path: "/user/manage",
		element: lazyLoad(React.lazy(() => import("@/views/user/UserManage"))),
		meta: {
			requiresAuth: true,
			title: "用户管理",
			key: "user-manage"
		}
	}
];

export default userRoutes;
