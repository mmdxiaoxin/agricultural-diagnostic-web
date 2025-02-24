import { LayoutIndex } from "@/routes/constant";
import React from "react";
import { RouteObjectEx } from "../interface";
import lazyLoad from "../helper/lazyLoad";

const userRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		children: [
			{
				path: "/user/index",
				element: lazyLoad(React.lazy(() => import("@/views/user/index"))),
				meta: {
					requiresAuth: true,
					title: "用户管理",
					key: "user"
				}
			}
		]
	}
];

export default userRouter;
