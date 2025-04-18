import { RemoteService } from "@/api/interface";
import ServiceListDrawer, { ServiceListDrawerRef } from "@/components/Drawer/ServiceListDrawer";
import ServiceList from "@/components/List/ServiceList";
import PageHeader from "@/components/PageHeader";
import ServiceDetail from "@/components/ServiceDetail";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Empty, Splitter } from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

const ServiceConfig: React.FC = () => {
	const [service, setService] = useState<RemoteService>();
	const [isMobile, setIsMobile] = useState(false);
	const serviceListDrawerRef = useRef<ServiceListDrawerRef>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// 从 sessionStorage 读取选中的服务
		const selectedServiceStr = sessionStorage.getItem("selectedService");
		if (selectedServiceStr) {
			try {
				const selectedService = JSON.parse(selectedServiceStr);
				setService(selectedService);
				// 读取后清除 sessionStorage
				sessionStorage.removeItem("selectedService");
			} catch (error) {
				console.error("解析选中的服务信息失败:", error);
			}
		}
	}, []);

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setIsMobile(width < 1024);
			}
		});

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
		};
	}, []);

	const handleServiceSelect = (selectedService: RemoteService) => {
		setService(selectedService);
		serviceListDrawerRef.current?.close();
	};

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-0 lg:p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-hidden"
			)}
		>
			<PageHeader
				title="服务配置"
				description={service ? `当前选择: ${service.serviceName}` : "请选择一个服务进行配置"}
				extra={
					isMobile ? (
						<Button
							type="primary"
							icon={<MenuOutlined />}
							onClick={() => serviceListDrawerRef.current?.open()}
						>
							选择服务
						</Button>
					) : null
				}
			/>
			<div
				ref={containerRef}
				className={clsx(
					"flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
				)}
			>
				{/* 主内容区域 */}
				{isMobile ? (
					<>
						{/* 移动端抽屉 */}
						<ServiceListDrawer
							ref={serviceListDrawerRef}
							selected={service}
							onSelect={handleServiceSelect}
						/>
						<div className="h-full w-full">
							{service ? (
								<ServiceDetail service={service} />
							) : (
								<div className="h-full w-full flex items-center justify-center bg-gray-50">
									<Empty
										description={
											window.innerWidth >= 1024
												? "请从左侧选择一个服务进行配置"
												: "请点击左上角按钮选择服务"
										}
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										className="text-gray-400"
									/>
								</div>
							)}
						</div>
					</>
				) : (
					<Splitter className="h-full">
						{/* 左侧服务列表 */}
						<Splitter.Panel defaultSize="30%" min="20%" max="50%" collapsible>
							<div className="h-full p-4 border-r border-gray-100">
								<ServiceList selected={service} onSelect={handleServiceSelect} />
							</div>
						</Splitter.Panel>

						{/* 右侧服务详情 */}
						<Splitter.Panel collapsible>
							<div className="h-full w-full">
								{service ? (
									<ServiceDetail service={service} />
								) : (
									<div className="h-full w-full flex items-center justify-center bg-gray-50">
										<Empty
											description={
												window.innerWidth >= 1024
													? "请从左侧选择一个服务进行配置"
													: "请点击左上角按钮选择服务"
											}
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											className="text-gray-400"
										/>
									</div>
								)}
							</div>
						</Splitter.Panel>
					</Splitter>
				)}
			</div>
		</div>
	);
};

export default ServiceConfig;
