import { RemoteConfig, RemoteInterface, RemoteService } from "@/api/interface";
import {
	copyRemoteConfig,
	copyRemoteInterface,
	getRemote,
	getRemoteConfigs,
	removeRemoteConfig,
	removeRemoteInterface
} from "@/api/modules";
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
import { ColumnsType } from "antd/es/table";
import React, { useEffect, useRef, useState } from "react";
import QuickCopy from "./Table/QuickCopy";
import TextCell from "./Table/TextCell";

export type ServiceDetailProps = {
	service?: RemoteService;
};

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
	const [configs, setConfigs] = useState<RemoteConfig[]>([]);
	const [interfaces, setInterfaces] = useState<RemoteInterface[]>([]);
	const [initLoading, setInitLoading] = useState(false);
	const interfaceModalRef = useRef<InterfaceModalRef>(null);
	const configModalRef = useRef<ConfigModalRef>(null);

	const fetchServiceDetail = async () => {
		if (service?.id) {
			try {
				setInitLoading(true);
				const [serviceResponse, configsResponse] = await Promise.all([
					getRemote(service.id),
					getRemoteConfigs(service.id)
				]);
				setConfigs(configsResponse.data || []);
				setInterfaces(serviceResponse.data?.interfaces || []);
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

	const handleAddConfig = () => {
		if (!service?.id) return;
		configModalRef.current?.open("create", service.id);
	};

	const handleEditConfig = (record: RemoteConfig) => {
		if (!service?.id) return;
		configModalRef.current?.open("edit", service.id, record);
	};

	const handleCopyConfig = async (record: RemoteConfig) => {
		if (!service?.id) return;
		try {
			await copyRemoteConfig(service.id, record.id);
			message.success("复制配置成功");
			fetchServiceDetail();
		} catch (error) {
			message.error("复制配置失败");
		}
	};

	const handleDeleteConfig = async (id: number) => {
		if (!service?.id) return;
		try {
			await removeRemoteConfig(service.id, id);
			message.success("删除配置成功");
			fetchServiceDetail();
		} catch (error) {
			message.error("删除配置失败");
		}
	};

	const configColumns: ColumnsType<RemoteConfig> = [
		{
			title: "配置名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "配置描述",
			dataIndex: "description",
			key: "description",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "success" : "error"}>
					{status === "active" ? "启用" : "禁用"}
				</Tag>
			),
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			render: (_, record) => (
				<Space wrap className="flex flex-col sm:flex-row">
					<Button type="link" onClick={() => handleEditConfig(record)}>
						编辑
					</Button>
					<Button type="link" onClick={() => handleCopyConfig(record)}>
						复制
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

	const handleCopyInterface = async (record: RemoteInterface) => {
		if (!service?.id) return;
		try {
			await copyRemoteInterface(service.id, record.id);
			message.success("复制接口成功");
			fetchServiceDetail();
		} catch (error) {
			message.error("复制接口失败");
		}
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

	const interfaceColumns: ColumnsType<RemoteInterface> = [
		{
			title: "接口名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "接口类型",
			dataIndex: "type",
			key: "type",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "接口地址",
			dataIndex: "url",
			key: "url",
			render: (_: string, record) => {
				const fullUrl = `${record.url ?? ""}${record.config.prefix ?? ""}${record.config.path ?? ""}`;
				return <QuickCopy text={fullUrl} />;
			},
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			render: (_, record) => (
				<Space wrap className="flex flex-col sm:flex-row">
					<Button type="link" onClick={() => handleEditInterface(record)}>
						编辑
					</Button>
					<Button type="link" onClick={() => handleCopyInterface(record)}>
						复制
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
					<Table<RemoteConfig>
						columns={configColumns}
						dataSource={configs}
						rowKey="id"
						scroll={{ x: "max-content" }}
						pagination={{
							total: configs.length,
							pageSize: 5,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: total => `共 ${total} 项`
						}}
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
					<Table<RemoteInterface>
						columns={interfaceColumns}
						dataSource={interfaces}
						rowKey="id"
						scroll={{ x: "max-content" }}
						pagination={{
							total: interfaces.length,
							pageSize: 5,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: total => `共 ${total} 项`
						}}
						loading={initLoading}
					/>
				</Card>
			)
		}
	];

	return (
		<>
			<div className="h-full flex flex-col">
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
			<ConfigModal
				ref={configModalRef}
				onSuccess={fetchServiceDetail}
				interfaces={interfaces || []}
			/>
		</>
	);
};

export default ServiceDetail;
