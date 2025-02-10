import { getAuthorButtons } from "@/api/modules/auth";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setAuthButtons } from "@/store/modules/authSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { Layout } from "antd";
import { useEffect } from "react";
import { Outlet } from "react-router";
import LayoutFooter from "./components/Footer";
import LayoutHeader from "./components/Header";
import LayoutMenu from "./components/Menu";
import LayoutTabs from "./components/Tabs";
import "./index.scss";

// 类型定义
export interface LayoutIndexProps {
	isCollapse: boolean;
}

const LayoutIndex = () => {
	const { Sider, Content } = Layout;
	const dispatch = useAppDispatch();
	const isCollapse = useAppSelector(state => state.menu.isCollapse);

	useEffect(() => {
		// 获取按钮权限列表
		const getAuthButtonsList = async () => {
			const { data } = await getAuthorButtons();
			dispatch(setAuthButtons(data || {}));
		};
		getAuthButtonsList();
	}, []);

	useEffect(() => {
		// 监听窗口大小变化
		const handleResize = () => {
			const screenWidth = window.innerWidth;
			if (screenWidth < 1200 && !isCollapse) {
				dispatch(setCollapse(true));
			} else if (screenWidth >= 1200 && isCollapse) {
				dispatch(setCollapse(false));
			}
		};

		// 绑定事件
		window.addEventListener("resize", handleResize);

		// 初始化时检查一次
		handleResize();

		// 清理事件
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [isCollapse]);

	return (
		<section className="container">
			<Sider trigger={null} collapsed={isCollapse} width={220} theme="dark">
				<LayoutMenu />
			</Sider>
			<Layout>
				<LayoutHeader />
				<LayoutTabs />
				<Content>
					<Outlet />
				</Content>
				<LayoutFooter />
			</Layout>
		</section>
	);
};

export default LayoutIndex;
