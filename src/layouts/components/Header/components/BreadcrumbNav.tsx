import { HOME_URL } from "@/config/config";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Breadcrumb } from "antd";
import { useLocation } from "react-router";

const BreadcrumbNav = () => {
	const { pathname } = useLocation();

	const global = useAppSelector(state => state.global);
	const breadcrumb = useAppSelector(state => state.breadcrumb);

	const { themeConfig } = global;
	const breadcrumbList = breadcrumb.breadcrumbList[pathname] || [];

	// 生成面包屑项
	const breadcrumbItems = [
		{
			title: <a href={`#${HOME_URL}`}>首页</a>
		},
		...breadcrumbList.map((item: any) => ({
			title: item !== "首页" ? item : null
		}))
	];

	return <>{!themeConfig.breadcrumb && <Breadcrumb items={breadcrumbItems} separator=">" />}</>;
};

export default BreadcrumbNav;
