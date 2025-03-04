import React from "react";
import lazyLoad from "../helper/lazyLoad";
import { RouteObjectEx } from "../interface";

const userRouter: RouteObjectEx[] = [
	{
		path: "/user/index",
		element: lazyLoad(React.lazy(() => import("@/views/user/index"))),
		meta: {
			requiresAuth: true,
			title: "用户管理",
			key: "user"
		}
	}
];

export default userRouter;
