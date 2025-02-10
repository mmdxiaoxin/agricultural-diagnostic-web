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

	return (
		<>
			{!themeConfig.breadcrumb && (
				<Breadcrumb>
					<Breadcrumb.Item href={`#${HOME_URL}`}>首页</Breadcrumb.Item>
					{breadcrumbList.map((item: string) => {
						return <Breadcrumb.Item key={item}>{item !== "首页" ? item : null}</Breadcrumb.Item>;
					})}
				</Breadcrumb>
			)}
		</>
	);
};

export default BreadcrumbNav;
