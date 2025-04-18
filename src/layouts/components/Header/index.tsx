import { useAppSelector } from "@/hooks/useAppSelector";
import { Layout, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import AssemblySize from "./components/AssemblySize";
import AvatarIcon from "./components/AvatarIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import CollapseIcon from "./components/CollapseIcon";
import Fullscreen from "./components/Fullscreen";
import Language from "./components/Language";
import Theme from "./components/Theme";
import LayoutMenu from "../Menu";
import { useState, useEffect } from "react";
import clsx from "clsx";

const LayoutHeader = () => {
	const { Header } = Layout;
	const { themeConfig } = useAppSelector(state => state.global);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [drawerVisible, setDrawerVisible] = useState(false);

	// 监听窗口大小变化
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			<Header
				className={clsx(
					"flex items-center justify-between h-[55px] px-[20px_40px_0_20px]",
					"border-b border-solid border-[#f6f6f6]",
					"[&_.collapsed]:mr-[20px] [&_.collapsed]:text-[18px] [&_.collapsed]:cursor-pointer [&_.collapsed]:transition-colors",
					"[&_.icon-style]:mr-[22px] [&_.icon-style]:text-[19px] [&_.icon-style]:leading-[19px] [&_.icon-style]:cursor-pointer [&_.icon-style]:text-[rgba(0,0,0,0.85)]",
					"[&_.username]:m-[0_20px_0_0] [&_.username]:text-[15px] [&_.username]:text-[rgba(0,0,0,0.85)]",
					"[&_.avatar]:cursor-pointer"
				)}
			>
				<div className="flex items-center">
					{isMobile && (
						<Button
							type="text"
							icon={<MenuOutlined />}
							onClick={() => setDrawerVisible(true)}
							className="text-lg"
						/>
					)}
					{!isMobile && <CollapseIcon />}
					<BreadcrumbNav />
				</div>
				<div className="flex items-center">
					{!isMobile && (
						<>
							<Language />
							<AssemblySize />
							<Theme />
							<Fullscreen />
						</>
					)}
					<AvatarIcon />
				</div>
			</Header>

			{isMobile && (
				<Drawer
					title="菜单"
					placement="left"
					onClose={() => setDrawerVisible(false)}
					open={drawerVisible}
					width={220}
					styles={{
						body: {
							padding: 0
						}
					}}
				>
					<LayoutMenu />
				</Drawer>
			)}
		</>
	);
};

export default LayoutHeader;
