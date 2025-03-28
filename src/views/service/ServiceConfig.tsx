import { RemoteService } from "@/api/interface";
import ServiceList from "@/components/List/ServiceList";
import ServiceDetail from "@/components/ServiceDetail";
import { Empty, Splitter, Card, Typography, Button, Space, message } from "antd";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import MonacoEditor from "@/components/Editor";
import { updateRemote } from "@/api/modules";

const ServiceConfig: React.FC = () => {
	const [service, setService] = useState<RemoteService>();
	const [configs, setConfigs] = useState<any[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);

	useEffect(() => {
		// 从 sessionStorage 读取选中的服务
		const selectedServiceStr = sessionStorage.getItem("selectedService");
		if (selectedServiceStr) {
			try {
				const selectedService = JSON.parse(selectedServiceStr);
				setService(selectedService);
				setConfigs(selectedService.configs || []);
				// 读取后清除 sessionStorage
				sessionStorage.removeItem("selectedService");
			} catch (error) {
				console.error("解析选中的服务信息失败:", error);
			}
		}
	}, []);

	const handleSave = async () => {
		if (!service?.id) return;
		try {
			setSaveLoading(true);
			await updateRemote(service.id, { configs });
			message.success("保存成功");
			setIsEditing(false);
		} catch (error) {
			message.error("保存失败");
		} finally {
			setSaveLoading(false);
		}
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
				</div>
			</div>

			<div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<Splitter className="h-full">
					<Splitter.Panel defaultSize="40%" min="20%" max="50%" collapsible>
						<div className="h-full p-4 border-r border-gray-100">
							<ServiceList selected={service} onSelect={service => setService(service)} />
						</div>
					</Splitter.Panel>
					<Splitter.Panel>
						{service ? (
							<div className="h-full flex flex-col">
								<Card className="flex-1 m-4">
									<div className="flex justify-between items-center mb-4">
										<Typography.Title level={4} className="!m-0">
											服务配置
										</Typography.Title>
										<Space>
											{isEditing ? (
												<>
													<Button onClick={() => setIsEditing(false)}>取消</Button>
													<Button type="primary" onClick={handleSave} loading={saveLoading}>
														保存
													</Button>
												</>
											) : (
												<Button type="primary" onClick={() => setIsEditing(true)}>
													编辑配置
												</Button>
											)}
										</Space>
									</div>
									<MonacoEditor
										language="json"
										value={JSON.stringify(configs, null, 2)}
										onChange={value => {
											if (isEditing) {
												try {
													setConfigs(JSON.parse(value));
												} catch (e) {
													// 忽略 JSON 解析错误
												}
											}
										}}
										options={{
											readOnly: !isEditing,
											minimap: { enabled: true },
											fontSize: 14,
											wordWrap: "on",
											scrollBeyondLastLine: false
										}}
									/>
								</Card>
								<ServiceDetail service={service} />
							</div>
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
