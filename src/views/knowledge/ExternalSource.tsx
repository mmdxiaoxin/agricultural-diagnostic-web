import React, { useEffect, useRef, useState } from "react";

const ExternalSource: React.FC = () => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const [iframeHeight, setIframeHeight] = useState("100%");

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

	return (
		<div className="h-full w-full relative">
			<iframe
				ref={iframeRef}
				src="https://cloud.sinoverse.cn/index_bch.html"
				title="农业病虫害数据中心"
				style={{
					width: "100%",
					height: iframeHeight, // 根据动态计算的高度设置
					border: "none"
				}}
				loading="lazy"
			/>
		</div>
	);
};

export default ExternalSource;
