import { HOME_URL } from "@/config/config";
import { RootState } from "@/store";
import { Breadcrumb } from "antd";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";

const BreadcrumbNav = () => {
	const { pathname } = useLocation();

	const global = useSelector((state: RootState) => state.global);
	const breadcrumb = useSelector((state: RootState) => state.breadcrumb);

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
