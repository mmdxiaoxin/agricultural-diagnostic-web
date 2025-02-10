import { HOME_URL } from "@/config/config";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { routerArray } from "@/routes";
import { setTabsList } from "@/store/modules/tabsSlice";
import { searchRoute } from "@/utils/index";
import { HomeFilled } from "@ant-design/icons";
import { Tabs } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import MoreButton from "./components/MoreButton";
import "./index.scss";

const LayoutTabs = () => {
	const { tabsList } = useAppSelector(state => state.tabs);
	const { themeConfig } = useAppSelector(state => state.global);
	const dispatch = useAppDispatch();
	const { pathname } = useLocation();
	const navigate = useNavigate();

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
		let newTabsList = [...tabsList];
		if (tabsList.every((item: any) => item.path !== route.path)) {
			newTabsList.push({ title: route.meta!.title, path: route.path as string });
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

	// 使用新版 items 属性来渲染 Tab
	const tabItems = tabsList.map((item: any) => ({
		key: item.path,
		label: (
			<span>
				{item.path === HOME_URL ? <HomeFilled /> : null}
				{item.title}
			</span>
		),
		closable: item.path !== HOME_URL
	}));

	return (
		<>
			{!themeConfig.tabs && (
				<div className="tabs">
					<Tabs
						animated
						activeKey={activeValue}
						onChange={clickTabs}
						hideAdd
						type="editable-card"
						onEdit={path => {
							delTabs(path as string);
						}}
						items={tabItems} // 使用新版 items 来替代 TabPane
					/>
					<MoreButton delTabs={delTabs} />
				</div>
			)}
		</>
	);
};

export default LayoutTabs;
