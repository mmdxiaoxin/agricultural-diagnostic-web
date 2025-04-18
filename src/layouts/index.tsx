import { getAuthorButtons } from "@/api/modules/auth";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setAuthButtons } from "@/store/modules/authSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { ConfigProvider, Layout } from "antd";
import { Locale } from "antd/es/locale";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import LayoutFooter from "./components/Footer";
import LayoutHeader from "./components/Header";
import LayoutMenu from "./components/Menu";
import LayoutTabs from "./components/Tabs";
import clsx from "clsx";

// 类型定义
export interface LayoutIndexProps {
	isCollapse: boolean;
}

const LayoutIndex = () => {
	const { Sider, Content } = Layout;

	const dispatch = useAppDispatch();
	const isCollapse = useAppSelector(state => state.menu.isCollapse);
	const { componentSize, language } = useAppSelector(state => state.global);

	const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
	const [locale, setLocal] = useState<Locale>(zhCN);

	useEffect(() => {
		// 设置语言
		if (language === "zhCN") {
			setLocal(zhCN);
		} else {
			setLocal(enUS);
		}
	}, [language]);

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
			setScreenWidth(screenWidth);
		};
		// 绑定事件
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// 根据屏幕宽度判断是否展开
	useEffect(() => {
		if (screenWidth < 1200) {
			dispatch(setCollapse(true));
		} else {
			dispatch(setCollapse(false));
		}
	}, [screenWidth]);

	return (
		<section
			className={clsx(
				"min-w-[768px] min-h-[564px] w-screen h-screen flex",
				"[&_.ant-layout-sider]:box-border [&_.ant-layout-sider]:border-r [&_.ant-layout-sider]:border-solid [&_.ant-layout-sider]:border-[#e4e7ed]",
				"[&_.ant-layout]:overflow-x-hidden",
				"[&_.ant-layout-content]:box-border [&_.ant-layout-content]:flex-1 [&_.ant-layout-content]:p-[10px_12px] [&_.ant-layout-content]:overflow-x-hidden",
				"[&_.ant-layout-content::-webkit-scrollbar]:bg-[#f0f2f5]",
				"[&_.ant-layout-content::-webkit-scrollbar-thumb]:bg-[#dddee0]"
			)}
		>
			<ConfigProvider
				componentSize={componentSize}
				locale={locale}
				theme={{
					components: {
						Layout: {
							bodyBg: "#f0f2f5",
							headerBg: "#ffffff",
							footerBg: "#ffffff",
							siderBg: "#ffffff"
						}
					}
				}}
			>
				<Sider trigger={null} collapsed={isCollapse} width={220} theme="light">
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
			</ConfigProvider>
		</section>
	);
};

export default LayoutIndex;
