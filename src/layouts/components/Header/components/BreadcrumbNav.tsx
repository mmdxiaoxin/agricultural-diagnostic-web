import { HOME_URL } from "@/config/config";
import { useAppSelector } from "@/hooks/useAppSelector";
import * as Icons from "@ant-design/icons";
import { Breadcrumb, BreadcrumbProps } from "antd";
import React from "react";
import { useLocation } from "react-router";

const BreadcrumbNav = () => {
	const { pathname } = useLocation();

	// 动态渲染 Icon 图标
	const DynamicIcon: { [key: string]: any } = Icons;
	const RenderIconByName = (name: string) => {
		return React.createElement(DynamicIcon[name]);
	};

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
					<>
						{RenderIconByName(item.icon)}
						{item.title}
					</>
				) : null
		}))
	];

	return <>{!themeConfig.breadcrumb && <Breadcrumb items={breadcrumbItems} separator=">" />}</>;
};

export default BreadcrumbNav;
