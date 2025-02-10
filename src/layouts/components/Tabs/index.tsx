import { HOME_URL } from "@/config/config";
import { routerArray } from "@/routes";
import { setTabsList } from "@/store/modules/tabsSlice"; // 直接导入slice
import { searchRoute } from "@/utils/index";
import { HomeFilled } from "@ant-design/icons";
import { Tabs, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import MoreButton from "./components/MoreButton";
import "./index.scss";
import { RootState } from "@/store";

const LayoutTabs = () => {
	const { tabsList } = useSelector((state: RootState) => state.tabs);
	const { themeConfig } = useSelector((state: RootState) => state.global); // 获取全局配置
	const dispatch = useDispatch(); // 获取dispatch方法
	const { TabPane } = Tabs;
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
		let newTabsList = [...tabsList]; // 使用扩展运算符复制tabsList
		if (tabsList.every((item: any) => item.path !== route.path)) {
			newTabsList.push({ title: route.meta!.title, path: route.path });
		}
		dispatch(setTabsList(newTabsList)); // 更新tabsList
		setActiveValue(pathname);
	};

	// 删除tab
	const delTabs = (tabPath?: string) => {
		if (tabPath === HOME_URL) return; // 不能删除首页tab
		if (pathname === tabPath) {
			tabsList.forEach((item: any, index: number) => {
				if (item.path !== pathname) return;
				const nextTab = tabsList[index + 1] || tabsList[index - 1];
				if (!nextTab) return;
				navigate(nextTab.path);
			});
		}
		message.success("你删除了Tabs标签 😆😆😆");
		dispatch(setTabsList(tabsList.filter((item: any) => item.path !== tabPath))); // 更新tabsList
	};

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
					>
						{tabsList.map((item: any) => {
							return (
								<TabPane
									key={item.path}
									tab={
										<span>
											{item.path === HOME_URL ? <HomeFilled /> : ""}
											{item.title}
										</span>
									}
									closable={item.path !== HOME_URL}
								></TabPane>
							);
						})}
					</Tabs>
					<MoreButton tabsList={tabsList} delTabs={delTabs} setTabsList={setTabsList} />
				</div>
			)}
		</>
	);
};

export default LayoutTabs;
