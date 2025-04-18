import { getAuthorButtons } from "@/api/modules/auth";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setAuthButtons } from "@/store/modules/authSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { ConfigProvider, Layout } from "antd";
import { Locale } from "antd/es/locale";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import LayoutFooter from "./components/Footer";
import LayoutHeader from "./components/Header";
import LayoutMenu from "./components/Menu";
import LayoutTabs from "./components/Tabs";

// 类型定义
export interface LayoutIndexProps {
	isCollapse: boolean;
}

const LayoutIndex = () => {
	const { Sider, Content } = Layout;

	const dispatch = useAppDispatch();
	const isCollapse = useAppSelector(state => state.menu.isCollapse);
	const { componentSize, language } = useAppSelector(state => state.global);

	const [locale, setLocal] = useState<Locale>(zhCN);
	const [isMobile, setIsMobile] = useState<boolean>(false);

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
			const width = window.innerWidth;
			setIsMobile(width < 768);
			// 在移动端自动折叠菜单
			if (width < 768) {
				dispatch(setCollapse(true));
			} else if (width < 1200) {
				dispatch(setCollapse(true));
			} else {
				dispatch(setCollapse(false));
			}
		};
		// 初始化状态
		handleResize();
		// 绑定事件
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<section
			className={clsx(
				"min-w-[320px] w-screen h-screen flex flex-col md:flex-row",
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
							siderBg: "#ffffff",
							headerPadding: "0 40px 0 20px"
						}
					}
				}}
			>
				{!isMobile && (
					<Sider
						trigger={null}
						collapsed={isCollapse}
						width={220}
						theme="light"
						collapsedWidth={isMobile ? 0 : 80}
						breakpoint="md"
					>
						<LayoutMenu />
					</Sider>
				)}
				<Layout className="flex-1 flex flex-col">
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
