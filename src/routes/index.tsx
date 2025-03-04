import LayoutIndex from "@/layouts";
import Login from "@/views/login/index";
import Register from "@/views/register";
import { Navigate, useRoutes } from "react-router";
import { RouteObjectEx } from "./interface";
import captureRouter from "./modules/capture";
import diagnosisRouter from "./modules/diagnosis";
import errorRoutes from "./modules/error";
import homeRouter from "./modules/home";
import knowledgeRouter from "./modules/knowledge";
import userRouter from "./modules/user";

export const layoutRoute: RouteObjectEx = {
	element: <LayoutIndex />,
	children: [...homeRouter, ...diagnosisRouter, ...userRouter, ...captureRouter, ...knowledgeRouter]
};

export const rootRoutes: RouteObjectEx[] = [
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
	{
		path: "/register",
		element: <Register />,
		meta: {
			requiresAuth: false,
			title: "注册页",
			key: "register"
		}
	},
	...errorRoutes,
	layoutRoute,
	{
		path: "*",
		element: <Navigate to="/404" />
	}
];

const Routes = () => {
	return useRoutes(rootRoutes);
};

export default Routes;
