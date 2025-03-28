import { RemoteService } from "@/api/interface";
import { getRemote, updateRemote } from "@/api/modules";
import MonacoEditor from "@/components/Editor";
import { StatusMapper } from "@/constants";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, message, Space, Tabs, Tag, Tooltip, Typography } from "antd";
import React, { useEffect, useState } from "react";

export type ServiceDetailProps = {
	service?: RemoteService;
	onSave?: (service: RemoteService) => void;
};

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onSave }) => {
	const [configs, setConfigs] = useState<any[]>([]);
	const [initLoading, setInitLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const fetchServiceDetail = async () => {
		if (service?.id) {
			try {
				setInitLoading(true);
				const response = await getRemote(service.id);
				setConfigs(response.data?.configs || []);
			} catch (error) {
				message.error("获取服务详情失败");
			} finally {
				setInitLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchServiceDetail();
	}, [service]);

	const handleSave = async () => {
		if (!service?.id) return;
		try {
			setSaveLoading(true);
			await updateRemote(service.id, { configs });
			message.success("保存成功");
			setIsEditing(false);
			fetchServiceDetail();
		} catch (error) {
			message.error("保存失败");
		} finally {
			setSaveLoading(false);
		}
	};

	const items = [
		{
			key: "1",
			label: "服务配置",
			children: (
				<Card>
					<div className="flex justify-between items-center mb-4">
						<Typography.Title level={4} className="!m-0">
							服务配置
						</Typography.Title>
						<Space>
							<Tooltip title="刷新配置">
								<Button
									icon={<ReloadOutlined />}
									onClick={fetchServiceDetail}
									loading={initLoading}
									className="hover:bg-gray-100"
								/>
							</Tooltip>
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
			)
		}
	];

	return (
		<div className="h-full flex flex-col p-6">
			<Card
				className="mb-6"
				title={
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Typography.Title level={4} className="!m-0">
								{service?.serviceName}
							</Typography.Title>
							<Tag color={service?.status === "active" ? "success" : "error"}>
								{StatusMapper[service?.status || "inactive"]}
							</Tag>
						</div>
					</div>
				}
			>
				<Tabs items={items} />
			</Card>
		</div>
	);
};

export default ServiceDetail;
