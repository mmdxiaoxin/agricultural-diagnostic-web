import Login from "@/views/login/index";
import { Navigate, useRoutes } from "react-router";
import errorRouter from "./modules/error";
import homeRouter from "./modules/home";

export const routerArray = [...errorRouter, ...homeRouter];

export const rootRouter = [
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
