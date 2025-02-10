import { getMenuList } from "@/api/modules/login";
import { setAuthRouter } from "@/store/modules/authSlice";
import { setBreadcrumbList } from "@/store/modules/breadcrumbSlice";
import { setMenuList } from "@/store/modules/menuSlice";
import { findAllBreadcrumb, getOpenKeys, handleRouter, searchRoute } from "@/utils/index";
import * as Icons from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import Logo from "./components/Logo";
import "./index.scss";

const LayoutMenu = () => {
	const { pathname } = useLocation();
	const { isCollapse } = useSelector((state: any) => state.menu); // 获取collapse状态
	const dispatch = useDispatch(); // 获取dispatch
	const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	// 刷新页面菜单保持高亮
	useEffect(() => {
		setSelectedKeys([pathname]);
		isCollapse ? null : setOpenKeys(getOpenKeys(pathname));
	}, [pathname, isCollapse]);

	// 设置当前展开的 subMenu
	const onOpenChange = (openKeys: string[]) => {
		if (openKeys.length === 0 || openKeys.length === 1) return setOpenKeys(openKeys);
		const latestOpenKey = openKeys[openKeys.length - 1];
		if (latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
		setOpenKeys([latestOpenKey]);
	};

	// 定义 menu 类型
	type MenuItem = Required<MenuProps>["items"][number];
	const getItem = (
		label: React.ReactNode,
		key?: React.Key | null,
		icon?: React.ReactNode,
		children?: MenuItem[],
		type?: "group"
	): MenuItem => {
		return {
			key,
			icon,
			children,
			label,
			type
		} as MenuItem;
	};

	// 动态渲染 Icon 图标
	const customIcons: { [key: string]: any } = Icons;
	const addIcon = (name: string) => {
		return React.createElement(customIcons[name]);
	};

	// 处理后台返回菜单 key 值为 antd 菜单需要的 key 值
	const deepLoopFloat = (menuList: Menu.MenuOptions[], newArr: MenuItem[] = []) => {
		menuList.forEach((item: Menu.MenuOptions) => {
			// 下面判断代码解释 *** !item?.children?.length   ==>   (!item.children || item.children.length === 0)
			if (!item?.children?.length)
				return newArr.push(getItem(item.title, item.path, addIcon(item.icon!)));
			newArr.push(
				getItem(item.title, item.path, addIcon(item.icon!), deepLoopFloat(item.children))
			);
		});
		return newArr;
	};

	// 获取菜单列表并处理成 antd menu 需要的格式
	const [menuList, setMenuListState] = useState<MenuItem[]>([]); // 使用内部状态存储menuList
	const [loading, setLoading] = useState(false);

	const getMenuData = async () => {
		setLoading(true);
		try {
			const { data } = await getMenuList();
			if (!data) return;
			setMenuListState(deepLoopFloat(data)); // 设置菜单列表
			// 存储处理过后的所有面包屑导航栏到 redux 中
			dispatch(setBreadcrumbList(findAllBreadcrumb(data)));
			// 把路由菜单处理成一维数组，存储到 redux 中，做菜单权限判断
			const dynamicRouter = handleRouter(data);
			dispatch(setAuthRouter(dynamicRouter));
			dispatch(setMenuList(data)); // 更新菜单列表到Redux
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getMenuData();
	}, []);

	// 点击当前菜单跳转页面
	const navigate = useNavigate();
	const clickMenu: MenuProps["onClick"] = ({ key }: { key: string }) => {
		const route = searchRoute(key, menuList);
		if (route.isLink) window.open(route.isLink, "_blank");
		navigate(key);
	};

	return (
		<div className="menu">
			<Spin spinning={loading} tip="Loading...">
				<Logo />
				<Menu
					theme="dark"
					mode="inline"
					triggerSubMenuAction="click"
					openKeys={openKeys}
					selectedKeys={selectedKeys}
					items={menuList}
					onClick={clickMenu}
					onOpenChange={onOpenChange}
				/>
			</Spin>
		</div>
	);
};

export default LayoutMenu;
