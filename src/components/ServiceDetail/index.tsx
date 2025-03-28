import { RemoteConfig, RemoteInterface, RemoteService } from "@/api/interface";
import { getRemote, removeRemoteInterface, updateRemote } from "@/api/modules";
import MonacoEditor from "@/components/Editor";
import ConfigModal, { ConfigModalRef } from "@/components/Modal/ConfigModal";
import InterfaceModal, { InterfaceModalRef } from "@/components/Modal/InterfaceModal";
import { StatusMapper } from "@/constants";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	message,
	Popconfirm,
	Space,
	Table,
	Tabs,
	Tag,
	Tooltip,
	Typography
} from "antd";
import React, { useEffect, useRef, useState } from "react";

export type ServiceDetailProps = {
	service?: RemoteService;
};

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
	const [configs, setConfigs] = useState<RemoteConfig[]>([]);
	const [interfaces, setInterfaces] = useState<RemoteInterface[]>([]);
	const [initLoading, setInitLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const interfaceModalRef = useRef<InterfaceModalRef>(null);
	const configModalRef = useRef<ConfigModalRef>(null);

	const fetchServiceDetail = async () => {
		if (service?.id) {
			try {
				setInitLoading(true);
				const response = await getRemote(service.id);
				setConfigs(response.data?.configs || []);
				setInterfaces(response.data?.interfaces || []);
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

	const handleAddConfig = () => {
		configModalRef.current?.open("create");
	};

	const handleEditConfig = (record: RemoteConfig) => {
		configModalRef.current?.open("edit", record);
	};

	const handleDeleteConfig = async (id: number) => {
		if (!service?.id) return;
		try {
			const newConfigs = configs.filter(config => config.id !== id);
			await updateRemote(service.id, { configs: newConfigs });
			message.success("删除配置成功");
			fetchServiceDetail();
		} catch (error) {
			message.error("删除配置失败");
		}
	};

	const handleConfigSave = async (values: any) => {
		if (!service?.id) return;
		try {
			const newConfigs = [...configs];
			if (values.id) {
				// 编辑模式
				const index = newConfigs.findIndex(config => config.id === values.id);
				if (index !== -1) {
					newConfigs[index] = { ...newConfigs[index], ...values };
				}
			} else {
				// 创建模式
				newConfigs.push({
					...values,
					id: Date.now(), // 临时ID，实际应该由后端生成
					serviceId: service.id
				});
			}
			await updateRemote(service.id, { configs: newConfigs });
			message.success(values.id ? "更新配置成功" : "添加配置成功");
			fetchServiceDetail();
		} catch (error) {
			message.error(values.id ? "更新配置失败" : "添加配置失败");
		}
	};

	const configColumns = [
		{
			title: "配置名称",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "配置描述",
			dataIndex: "description",
			key: "description"
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "success" : "error"}>
					{status === "active" ? "启用" : "禁用"}
				</Tag>
			)
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record: RemoteConfig) => (
				<Space>
					<Button type="link" onClick={() => handleEditConfig(record)}>
						编辑
					</Button>
					<Popconfirm title="确认删除此配置？" onConfirm={() => handleDeleteConfig(record.id)}>
						<Button type="link" danger>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	const handleAddInterface = () => {
		interfaceModalRef.current?.open("create", undefined, service?.id);
	};

	const handleEditInterface = (record: RemoteInterface) => {
		interfaceModalRef.current?.open("edit", record, service?.id);
	};

	const handleDeleteInterface = async (id: number) => {
		if (!service?.id) return;
		try {
			await removeRemoteInterface(service.id, id);
			message.success("删除接口成功");
			fetchServiceDetail();
		} catch (error) {
			message.error("删除接口失败");
		}
	};

	const interfaceColumns = [
		{
			title: "接口名称",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "接口类型",
			dataIndex: "type",
			key: "type"
		},
		{
			title: "接口地址",
			dataIndex: "url",
			key: "url"
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record: RemoteInterface) => (
				<Space>
					<Button type="link" onClick={() => handleEditInterface(record)}>
						编辑
					</Button>
					<Popconfirm title="确认删除此接口？" onConfirm={() => handleDeleteInterface(record.id)}>
						<Button type="link" danger>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

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
							<Button type="primary" icon={<PlusOutlined />} onClick={handleAddConfig}>
								添加配置
							</Button>
						</Space>
					</div>
					<Table
						columns={configColumns}
						dataSource={configs}
						rowKey="id"
						pagination={false}
						loading={initLoading}
					/>
				</Card>
			)
		},
		{
			key: "2",
			label: "接口管理",
			children: (
				<Card>
					<div className="flex justify-between items-center mb-4">
						<Typography.Title level={4} className="!m-0">
							接口管理
						</Typography.Title>
						<Space>
							<Tooltip title="刷新接口">
								<Button
									icon={<ReloadOutlined />}
									onClick={fetchServiceDetail}
									loading={initLoading}
									className="hover:bg-gray-100"
								/>
							</Tooltip>
							<Button type="primary" icon={<PlusOutlined />} onClick={handleAddInterface}>
								添加接口
							</Button>
						</Space>
					</div>
					<Table
						columns={interfaceColumns}
						dataSource={interfaces}
						rowKey="id"
						pagination={false}
						loading={initLoading}
					/>
				</Card>
			)
		}
	];

	return (
		<>
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
			<InterfaceModal ref={interfaceModalRef} onSave={fetchServiceDetail} />
			<ConfigModal ref={configModalRef} onSave={handleConfigSave} />
		</>
	);
};

export default ServiceDetail;
