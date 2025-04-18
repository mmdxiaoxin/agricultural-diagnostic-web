import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Layout } from "antd";
import clsx from "clsx";
import { useEffect, useState } from "react";
import LayoutMenu from "../Menu";
import AssemblySize from "./components/AssemblySize";
import AvatarIcon from "./components/AvatarIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import CollapseIcon from "./components/CollapseIcon";
import Fullscreen from "./components/Fullscreen";
import Language from "./components/Language";
import Theme from "./components/Theme";

const LayoutHeader = () => {
	const { Header } = Layout;
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
					"border-b border-solid border-[#f6f6f6]"
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
