import ExternalSourceDrawer, {
	ExternalSourceDrawerRef
} from "@/components/Drawer/ExternalSourceDrawer";
import { FloatButton } from "antd";
import React, { useEffect, useRef, useState } from "react";

const ExternalSource: React.FC = () => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const drawerRef = useRef<ExternalSourceDrawerRef>(null);

	const [iframeHeight, setIframeHeight] = useState("100%");
	const [iframeSrc, setIframeSrc] = useState("https://cloud.sinoverse.cn/index_bch.html");

	// 监听父容器尺寸变化，调整 iframe 高度
	useEffect(() => {
		const handleResize = () => {
			if (iframeRef.current) {
				const containerHeight = iframeRef.current.parentElement?.clientHeight;
				if (containerHeight) {
					setIframeHeight(`${containerHeight}px`);
				}
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const changeIframeSource = (newSource: string) => {
		setIframeSrc(newSource);
		console.log("changeIframeSource", newSource);
	};

	return (
		<div className="h-full w-full relative">
			<iframe
				ref={iframeRef}
				src={iframeSrc}
				title="农业病虫害数据中心"
				style={{
					width: "100%",
					height: iframeHeight, // 根据动态计算的高度设置
					border: "none"
				}}
				loading="lazy"
			/>
			<FloatButton onClick={() => drawerRef.current?.open()} />;
			<ExternalSourceDrawer ref={drawerRef} onClick={url => changeIframeSource(url)} />
		</div>
	);
};

export default ExternalSource;
