import { RemoteService } from "@/api/interface";
import ServiceList from "@/components/List/ServiceList";
import ServiceDetail from "@/components/ServiceDetail";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Button, Empty, Splitter, Tooltip } from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

const ServiceConfig: React.FC = () => {
	const [service, setService] = useState<RemoteService>();
	const [isFullscreen, setIsFullscreen] = useState(false);
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

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-hidden"
			)}
		>
			{!isFullscreen && (
				<div
					className={clsx(
						"flex flex-col gap-6",
						"mb-6 p-6",
						"rounded-2xl",
						"bg-white",
						"shadow-sm",
						"border border-gray-100",
						"transition-all duration-300",
						"hover:shadow-md"
					)}
				>
					<div className="flex justify-between items-center">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">服务配置</h2>
							<p className="text-gray-500">
								{service ? `当前选择: ${service.serviceName}` : "请选择一个服务进行配置"}
							</p>
						</div>
						{service && (
							<Tooltip title={isFullscreen ? "展开" : "折叠"}>
								<Button
									type="text"
									icon={isFullscreen ? <CaretDownOutlined /> : <CaretUpOutlined />}
									onClick={toggleFullscreen}
									className="hover:bg-gray-100"
								/>
							</Tooltip>
						)}
					</div>
				</div>
			)}

			<div
				ref={containerRef}
				className={clsx(
					"flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative",
					isFullscreen && "fixed inset-0 z-50 m-0 rounded-none transform scale-100"
				)}
			>
				{isFullscreen && (
					<div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10">
						<div className="flex items-center gap-4">
							<h3 className="text-lg font-medium text-gray-800">服务配置</h3>
							<p className="text-gray-500">
								{service ? `当前选择: ${service.serviceName}` : "请选择一个服务进行配置"}
							</p>
						</div>
						<Tooltip title="展开">
							<Button
								type="text"
								icon={<CaretDownOutlined />}
								onClick={toggleFullscreen}
								className="hover:bg-gray-100"
							/>
						</Tooltip>
					</div>
				)}
				<Splitter className={clsx("h-full", isFullscreen && "pt-16")}>
					<Splitter.Panel defaultSize="40%" min="20%" max="50%" collapsible>
						<div className="h-full p-4 border-r border-gray-100">
							<ServiceList selected={service} onSelect={service => setService(service)} />
						</div>
					</Splitter.Panel>
					<Splitter.Panel>
						{service ? (
							<ServiceDetail service={service} />
						) : (
							<div className="h-full flex items-center justify-center bg-gray-50">
								<Empty
									description="请从左侧选择一个服务进行配置"
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									className="text-gray-400"
								/>
							</div>
						)}
					</Splitter.Panel>
				</Splitter>
			</div>
		</div>
	);
};

export default ServiceConfig;
