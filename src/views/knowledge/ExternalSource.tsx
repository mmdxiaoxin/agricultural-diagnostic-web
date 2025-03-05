import ExternalSourceDrawer, {
	ExternalSourceDrawerRef
} from "@/components/Drawer/ExternalSourceDrawer";
import { FloatButton, Spin, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";

const ExternalSource: React.FC = () => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const drawerRef = useRef<ExternalSourceDrawerRef>(null);

	const [iframeHeight, setIframeHeight] = useState("100%");
	const [iframeSrc, setIframeSrc] = useState("https://cloud.sinoverse.cn/index_bch.html");
	const [loading, setLoading] = useState(true);

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

	const handleIframeLoad = () => {
		setLoading(false);
	};

	const changeIframeSource = (newSource: string) => {
		setLoading(true);
		setIframeSrc(newSource);
	};

	return (
		<div className="h-full w-full relative">
			{/* Loading Spinner */}
			{loading && (
				<div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-50 z-10">
					<Spin size="large" />
				</div>
			)}

			<iframe
				ref={iframeRef}
				src={iframeSrc}
				title="农业病虫害数据中心"
				style={{
					width: "100%",
					height: iframeHeight,
					border: "none"
				}}
				loading="lazy"
				onLoad={handleIframeLoad}
			/>
			<Tooltip title="切换数据源" placement="left">
				<FloatButton onClick={() => drawerRef.current?.toggle()} />
			</Tooltip>
			<ExternalSourceDrawer ref={drawerRef} onClick={url => changeIframeSource(url)} />
		</div>
	);
};

export default ExternalSource;
