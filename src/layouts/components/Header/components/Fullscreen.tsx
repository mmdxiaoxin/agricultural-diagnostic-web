import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import clsx from "clsx";
import { useEffect, useState } from "react";
import screenfull from "screenfull";

const Fullscreen = () => {
	const [fullScreen, setFullScreen] = useState<boolean>(screenfull.isFullscreen);

	useEffect(() => {
		screenfull.on("change", () => {
			if (screenfull.isFullscreen) setFullScreen(true);
			else setFullScreen(false);
			return () => screenfull.off("change", () => {});
		});
	}, []);

	const handleFullScreen = () => {
		if (!screenfull.isEnabled) message.warning("当前您的浏览器不支持全屏 ❌");
		screenfull.toggle();
	};

	return (
		<Button
			className={clsx(
				"mr-[22px] text-[19px] leading-[19px] cursor-pointer text-[rgba(0,0,0,0.85)]"
			)}
			onClick={handleFullScreen}
			icon={fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
			type="text"
		/>
	);
};
export default Fullscreen;
