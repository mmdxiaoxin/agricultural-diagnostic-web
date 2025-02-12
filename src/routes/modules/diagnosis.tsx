import { LayoutIndex } from "@/routes/constant";
import lazyLoad from "@/routes/utils/lazyLoad";
import React from "react";
import { RouteObjectEx } from "../interface";

const diagnosisRouter: RouteObjectEx[] = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "病害诊断"
		},
		children: [
			{
				path: "/diagnosis/imageDiagnosis",
				element: lazyLoad(React.lazy(() => import("@/views/diagnosis/imageDiagnosis/index"))),
				meta: {
					requiresAuth: true,
					title: "病害图片诊断",
					key: "imageDiagnosis"
				}
			}
		]
	}
];

export default diagnosisRouter;
