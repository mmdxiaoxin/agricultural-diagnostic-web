import IconComponent, { Icons } from "@/components/IconComponent";
import { HOME_URL } from "@/config/config";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Breadcrumb, BreadcrumbProps, Space } from "antd";
import { useLocation } from "react-router";

const BreadcrumbNav = () => {
	const { pathname } = useLocation();

	const global = useAppSelector(state => state.global);
	const breadcrumb = useAppSelector(state => state.breadcrumb);

	const { themeConfig } = global;
	const breadcrumbList = breadcrumb.breadcrumbList[pathname] || [];

	// 生成面包屑项
	const breadcrumbItems: BreadcrumbProps["items"] = [
		{
			title: "首页",
			href: `${HOME_URL}`
		},
		...breadcrumbList.map(item => ({
			title:
				item.title !== "首页" ? (
					<Space>
						<IconComponent name={item.icon as keyof typeof Icons} />
						{item.title}
					</Space>
				) : null
		}))
	];

	return <>{!themeConfig.breadcrumb && <Breadcrumb items={breadcrumbItems} separator=">" />}</>;
};

export default BreadcrumbNav;
