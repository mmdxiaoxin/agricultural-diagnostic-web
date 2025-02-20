import IconComponent from "@/components/IconComponent";
import { HOME_URL } from "@/config/config";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { routerArray } from "@/routes";
import { setTabsList } from "@/store/modules/tabsSlice";
import { searchRoute } from "@/utils/index";
import { Tabs, TabsProps } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import MoreButton from "./components/MoreButton";
import "./index.scss";

const LayoutTabs = () => {
	const { tabsList } = useAppSelector(state => state.tabs);

	const { themeConfig } = useAppSelector(state => state.global);

	const { pathname } = useLocation();

	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [activeValue, setActiveValue] = useState<string>(pathname);

	useEffect(() => {
		addTabs();
	}, [pathname]);

	// 点击tab
	const clickTabs = (path: string) => {
		navigate(path);
	};

	// 添加tabs
	const addTabs = () => {
		const route = searchRoute(pathname, routerArray);
		const newTabsList = [...tabsList];

		if (
			Object.keys(route.params).length === 0 &&
			tabsList.every((item: any) => item.path !== route.path)
		) {
			newTabsList.push({
				title: route.meta?.title || "",
				path: route.path as string
			});
		}

		dispatch(setTabsList(newTabsList));
		setActiveValue(pathname);
	};

	// 删除tab
	const delTabs = (tabPath?: string) => {
		if (tabPath === HOME_URL) return;

		if (pathname === tabPath) {
			tabsList.forEach((item: any, index: number) => {
				if (item.path !== pathname) return;
				const nextTab = tabsList[index + 1] || tabsList[index - 1];
				if (!nextTab) return;
				navigate(nextTab.path);
			});
		}

		dispatch(setTabsList(tabsList.filter((item: any) => item.path !== tabPath)));
	};

	const tabItems: TabsProps["items"] = tabsList.map((item: any) => ({
		key: item.path,
		label: item.title,
		closable: item.path !== HOME_URL,
		icon: item.path === HOME_URL ? <IconComponent name="HomeFilled" /> : undefined
	}));

	if (themeConfig.tabs) return null;
	else
		return (
			<Tabs
				style={{ borderBottom: "1px solid #f0f0f0" }}
				className={"tabs"}
				animated
				activeKey={activeValue}
				onChange={clickTabs}
				hideAdd
				type="editable-card"
				items={tabItems}
				onEdit={path => {
					delTabs(path as string);
				}}
				tabBarExtraContent={{
					right: <MoreButton delTabs={delTabs} />
				}}
			/>
		);
};

export default LayoutTabs;
