import Login from "@/views/login/index";
import { Navigate, useRoutes } from "react-router";
import { RouteObjectEx } from "./interface";
import diagnosisRouter from "./modules/diagnosis";
import errorRouter from "./modules/error";
import homeRouter from "./modules/home";
import userRouter from "./modules/user";

export const routerArray: RouteObjectEx[] = [
	...errorRouter,
	...homeRouter,
	...diagnosisRouter,
	...userRouter
];

export const rootRouter: RouteObjectEx[] = [
	{
		path: "/",
		element: <Navigate to="/login" />
	},
	{
		path: "/login",
		element: <Login />,
		meta: {
			requiresAuth: false,
			title: "登录页",
			key: "login"
		}
	},
	...routerArray,
	{
		path: "*",
		element: <Navigate to="/404" />
	}
];

const Routes = () => {
	const routes = useRoutes(rootRouter);
	return routes;
};

export default Routes;
