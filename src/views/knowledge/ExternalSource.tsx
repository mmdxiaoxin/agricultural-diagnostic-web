import ExternalSourceDrawer, {
	ExternalSourceDrawerRef
} from "@/components/Drawer/ExternalSourceDrawer";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { markExternalSourceTourShown } from "@/store/modules/tourSlice";
import { FloatButton, Spin, Tooltip, Tour, TourProps } from "antd";
import React, { useEffect, useRef, useState } from "react";

const ExternalSource: React.FC = () => {
	const dispatch = useAppDispatch();
	const hasShownTour = useAppSelector(state => state.tour.hasShownExternalSourceTour);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const drawerRef = useRef<ExternalSourceDrawerRef>(null);
	const floatButtonRef = useRef<any>(null);

	const [iframeHeight, setIframeHeight] = useState("100%");
	const [iframeSrc, setIframeSrc] = useState("https://cloud.sinoverse.cn/index_bch.html");
	const [loading, setLoading] = useState(true);
	const [tourOpen, setTourOpen] = useState(false);

	// 首次访问时自动显示 Tour
	useEffect(() => {
		if (!hasShownTour) {
			setTimeout(() => {
				setTourOpen(true);
			}, 500);
		}
	}, [hasShownTour]);

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

	const handleTourClose = () => {
		setTourOpen(false);
		dispatch(markExternalSourceTourShown());
	};

	const steps: TourProps["steps"] = [
		{
			title: "外部数据源",
			description: "这里展示了来自第三方平台的农业病虫害数据，包括详细的病害信息和防治方法",
			target: () => iframeRef.current as HTMLElement
		},
		{
			title: "切换数据源",
			description:
				"点击这里可以切换到其他数据源，包括农业病虫害信息云数据库、药用植物病虫害数据库等",
			target: () => floatButtonRef.current as HTMLElement
		}
	];

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
				<FloatButton ref={floatButtonRef} onClick={() => drawerRef.current?.toggle()} />
			</Tooltip>
			<ExternalSourceDrawer ref={drawerRef} onClick={url => changeIframeSource(url)} />
			<Tour open={tourOpen} onClose={handleTourClose} steps={steps} />
		</div>
	);
};

export default ExternalSource;
