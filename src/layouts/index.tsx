import { getAuthorButtons } from "@/api/modules/login";
import { RootState } from "@/store";
import { setAuthButtons } from "@/store/modules/authSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { Layout } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
	const dispatch = useDispatch();
	const isCollapse = useSelector((state: RootState) => state.menu.isCollapse);

	// 获取按钮权限列表
	const getAuthButtonsList = async () => {
		const { data } = await getAuthorButtons();
		dispatch(setAuthButtons(data || {}));
	};

	// 监听窗口大小变化
	const listeningWindow = () => {
		window.onresize = () => {
			const screenWidth = document.body.clientWidth;
			if (!isCollapse && screenWidth < 1200) {
				dispatch(setCollapse(true));
			}
			if (!isCollapse && screenWidth > 1200) {
				dispatch(setCollapse(false));
			}
		};
	};

	useEffect(() => {
		listeningWindow();
		getAuthButtonsList();
	}, [isCollapse, dispatch]);

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
