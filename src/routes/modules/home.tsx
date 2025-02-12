import { LayoutIndex } from "@/routes/constant";
import Home from "@/views/home/index";
import { RouteObjectEx } from "../interface";

// 首页模块
const homeRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		children: [
			{
				path: "/home/index",
				// element: lazyLoad(React.lazy(() => import("@/views/home/index"))),
				element: <Home />,
				meta: {
					requiresAuth: true,
					title: "首页",
					key: "home"
				}
			}
		]
	}
];

export default homeRouter;
