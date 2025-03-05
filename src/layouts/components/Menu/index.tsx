import { getAuthRoutes } from "@/api/modules/menu";
import IconComponent, { Icons } from "@/components/IconComponent";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RouteObjectEx } from "@/routes/interface";
import { setAuthRouter } from "@/store/modules/authSlice";
import { setBreadcrumbList } from "@/store/modules/breadcrumbSlice";
import { setMenuList } from "@/store/modules/menuSlice";
import { findAllBreadcrumb, getOpenKeys, handleRouter, searchRoute } from "@/utils/index";
import type { MenuProps } from "antd";
import { Menu, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Logo from "./components/Logo";
import styles from "./index.module.scss";

// MenuItem 类型，明确菜单项结构
type MenuItem = Required<MenuProps>["items"][number];

// 递归处理菜单数据，转换为 antd menu 所需的格式
const deepLoopFloat = (menuList: Menu.MenuOptions[], newArr: MenuItem[] = []): MenuItem[] => {
	menuList.forEach(item => {
		// 如果没有子菜单，直接添加菜单项
		if (!item?.children?.length) {
			newArr.push({
				key: item.path,
				icon: <IconComponent name={item.icon as keyof typeof Icons} />,
				label: item.title
			});
		} else {
			newArr.push({
				key: item.path,
				icon: <IconComponent name={item.icon as keyof typeof Icons} />,
				label: item.title,
				children: deepLoopFloat(item.children)
			});
		}
	});
	return newArr;
};

const LayoutMenu: React.FC = () => {
	const { pathname } = useLocation();
	const { isCollapse } = useAppSelector(state => state.menu);
	const dispatch = useAppDispatch();

	const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);
	const [menuList, setMenuListState] = useState<MenuItem[]>([]);
	const [loading, setLoading] = useState(false);

	// 刷新页面菜单保持高亮
	useEffect(() => {
		setSelectedKeys([pathname]);
		if (!isCollapse) {
			setOpenKeys(getOpenKeys(pathname));
		}
	}, [pathname, isCollapse]);

	// 获取菜单数据并处理
	const getMenuData = async (): Promise<void> => {
		setLoading(true);
		try {
			const { data } = await getAuthRoutes();
			if (data) {
				const formattedMenuList = deepLoopFloat(data);
				setMenuListState(formattedMenuList); // 设置菜单列表
				// 存储面包屑数据和菜单数据到 Redux
				dispatch(setBreadcrumbList(findAllBreadcrumb(data)));
				const dynamicRouter = handleRouter(data);
				dispatch(setAuthRouter(dynamicRouter));
				dispatch(setMenuList(data)); // 更新菜单列表到 Redux
			}
		} catch (error) {
			console.error("获取菜单数据失败", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getMenuData();
	}, []);

	// 点击菜单跳转页面
	const navigate = useNavigate();
	const clickMenu: MenuProps["onClick"] = ({ key }: { key: string }) => {
		const route = searchRoute(key, menuList as RouteObjectEx[]);
		if (route.isLink) {
			window.open(route.isLink, "_blank");
		} else {
			navigate(key);
		}
	};

	// 设置子菜单展开行为
	const onOpenChange = (openKeys: string[]) => {
		if (openKeys.length === 0 || openKeys.length === 1) {
			setOpenKeys(openKeys);
		} else {
			const latestOpenKey = openKeys[openKeys.length - 1];
			if (latestOpenKey.includes(openKeys[0])) {
				setOpenKeys(openKeys);
			} else {
				setOpenKeys([latestOpenKey]);
			}
		}
	};

	return (
		<div className={styles.menu}>
			<Spin spinning={loading} tip="加载中...">
				<Logo />
				<Menu
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
