import { HOME_URL } from "@/config/config";
import { rootRoutes } from "@/routes/index";
import { store } from "@/store";
import { searchRoute } from "@/utils";
import { message } from "antd";
import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";

export type AuthRouterProps = PropsWithChildren<{}>;

/**
 * @description 路由守卫组件
 * */
const AuthRouter: React.FC<AuthRouterProps> = props => {
	const { pathname } = useLocation();
	const route = searchRoute(pathname, rootRoutes);

	// * 判断当前路由是否需要访问权限(不需要权限直接放行)
	if (!route.meta?.requiresAuth) return props.children;

	// * 从 Redux 中获取 token 和动态路由
	const token = store.getState().auth.token;

	// * Dynamic Router(动态路由，根据后端返回的菜单数据生成的一维数组)
	const dynamicRouter = store.getState().auth.authRouter;

	// * 判断是否有Token
	if (!token) {
		message.error("请先登录", 1.5);
		return <Navigate to="/login" replace />;
	}

	// * Static Router
	const staticRouter = [HOME_URL, "/403", "/404", "/500"];
	const routerList = dynamicRouter.concat(staticRouter);

	// * 如果访问的地址没有在路由表中重定向到403页面
	if (routerList.indexOf(pathname) === -1) {
		message.error("您没有权限访问该页面", 1.5);
		return <Navigate to="/403" />;
	}

	// * 当前账号有权限返回 Router，正常访问页面
	return props.children;
};

export default AuthRouter;
