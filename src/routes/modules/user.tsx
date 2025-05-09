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
	},
	{
		path: "/user/menu/manage",
		element: lazyLoad(React.lazy(() => import("@/views/user/MenuManage"))),
		meta: {
			requiresAuth: true,
			title: "菜单管理",
			key: "menu-manage"
		}
	},
	{
		path: "/user/role/manage",
		element: lazyLoad(React.lazy(() => import("@/views/user/RoleManage"))),
		meta: {
			requiresAuth: true,
			title: "角色管理",
			key: "role-manage"
		}
	}
];

export default userRoutes;
