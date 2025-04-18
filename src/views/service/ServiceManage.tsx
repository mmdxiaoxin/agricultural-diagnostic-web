import { RemoteService } from "@/api/interface/service";
import { copyRemote, getRemotesList, remoteRemote } from "@/api/modules";
import ConfigListModal, { ConfigListModalRef } from "@/components/Modal/ConfigListModal";
import InterfaceListModal, { InterfaceListModalRef } from "@/components/Modal/InterfaceListModal";
import ServiceModal, { ServiceModalRef } from "@/components/Modal/ServiceModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { StatusMapper } from "@/constants";
import {
	CodepenOutlined,
	CopyOutlined,
	DeleteOutlined,
	PlusOutlined,
	SettingOutlined
} from "@ant-design/icons";
import { Button, message, Popconfirm, Space, Table, TableColumnType, Tag, Tooltip } from "antd";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const ServiceManage: React.FC = () => {
	const serviceModalRef = useRef<ServiceModalRef>(null);
	const interfaceModalRef = useRef<InterfaceListModalRef>(null);
	const configModalRef = useRef<ConfigListModalRef>(null);

	const [services, setServices] = useState<RemoteService[]>([]);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
	const [total, setTotal] = useState(0);
	const [selectedService, setSelectedService] = useState<RemoteService | null>(null);
	const [initLoading, setInitLoading] = useState(false);

	const navigate = useNavigate();

	const fetchServices = async (page: number = 1, pageSize: number = 10) => {
		setInitLoading(true);
		try {
			const response = await getRemotesList({ page, pageSize });
			if (response.code === 200 && response.data) {
				setServices(response.data.list || []);
				setTotal(response.data.total || 0);
			}
		} catch (error) {
		} finally {
			setInitLoading(false);
		}
	};

	useEffect(() => {
		fetchServices();
	}, []);

	const handleEditService = (service: any) => {
		serviceModalRef.current?.open("edit", service);
	};

	const handleCreateService = () => {
		serviceModalRef.current?.open("create");
	};

	const handleDeleteService = async (serviceId: number) => {
		try {
			await remoteRemote(serviceId);
			setPagination({
				...pagination,
				page: 1
			});
			fetchServices(1, pagination.pageSize);
			message.success("删除服务成功");
		} catch (error) {
			message.error("删除服务失败");
		}
	};

	const handleCopyService = async (serviceId: number) => {
		try {
			await copyRemote(serviceId);
			fetchServices(pagination.page, pagination.pageSize);
			message.success("复制服务成功");
		} catch (error) {
			message.error("复制服务失败");
		}
	};

	const handleQuickConfig = (service: RemoteService) => {
		// 将服务信息存储到 sessionStorage
		sessionStorage.setItem("selectedService", JSON.stringify(service));
		// 导航到配置页面
		navigate("/service/config");
	};

	const handleShowInterfaces = (service: RemoteService) => {
		setSelectedService(service);
		interfaceModalRef.current?.open();
	};

	const handleShowConfigs = (service: RemoteService) => {
		setSelectedService(service);
		configModalRef.current?.open();
	};

	const columns: TableColumnType<RemoteService>[] = [
		{
			title: "服务名称",
			dataIndex: "serviceName",
			key: "serviceName",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "服务类型",
			dataIndex: "serviceType",
			key: "serviceType",
			render: (text: string) => (
				<Tag color="blue" className="px-2 py-0.5 rounded-md">
					{text}
				</Tag>
			),
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "服务描述",
			dataIndex: "description",
			key: "description",
			render: (text: string) => <TextCell text={text || "-"} />,
			responsive: ["md", "lg", "xl", "xxl"]
		},
		{
			title: "服务状态",
			dataIndex: "status",
			key: "status",
			render: (text: string) => (
				<Tag
					color={text === "active" ? "success" : text === "inactive" ? "error" : "warning"}
					className="px-2 py-0.5 rounded-md"
				>
					{StatusMapper[text as RemoteService["status"]]}
				</Tag>
			),
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "配置数量",
			key: "configCount",
			dataIndex: "configCount",
			render: (_: unknown, record: RemoteService) => (
				<Tag
					color="purple"
					className={clsx(
						"px-2 py-0.5 rounded-md",
						"cursor-pointer hover:opacity-80",
						"transition-all duration-300"
					)}
					onClick={() => handleShowConfigs(record)}
				>
					{record.configs?.length || 0} 个配置
				</Tag>
			),
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "接口数量",
			key: "interfaceCount",
			dataIndex: "interfaceCount",
			render: (_: unknown, record: RemoteService) => (
				<Tag
					color="cyan"
					className={clsx(
						"px-2 py-0.5 rounded-md",
						"cursor-pointer hover:opacity-80",
						"transition-all duration-300"
					)}
					onClick={() => handleShowInterfaces(record)}
				>
					{record.interfaces?.length || 0} 个接口
				</Tag>
			),
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: (text: string) => (
				<span className="text-gray-500">{new Date(text).toLocaleString()}</span>
			),
			responsive: ["xl", "xxl"]
		},
		{
			title: "操作",
			key: "actions",
			dataIndex: "actions",
			align: "center",
			fixed: "right",
			render: (_: unknown, record: RemoteService) => (
				<Space wrap className={clsx("xs:w-40 lg:w-80")}>
					<Tooltip title="快速配置">
						<Button
							onClick={() => handleQuickConfig(record)}
							type="primary"
							icon={<SettingOutlined />}
							className={clsx(
								"px-3 h-8",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							配置
						</Button>
					</Tooltip>
					<Button
						onClick={() => {
							const { createdAt, updatedAt, ...serviceData } = record;
							handleEditService(serviceData);
						}}
						type="primary"
						icon={<CodepenOutlined />}
						className={clsx(
							"px-3 h-8",
							"rounded-lg",
							"bg-blue-500 hover:bg-blue-600",
							"border-none",
							"shadow-sm hover:shadow-md",
							"transition-all duration-300"
						)}
					>
						编辑
					</Button>
					<Button
						onClick={() => handleCopyService(record.id)}
						type="primary"
						icon={<CopyOutlined />}
						className={clsx(
							"px-3 h-8",
							"rounded-lg",
							"bg-blue-500 hover:bg-blue-600",
							"border-none",
							"shadow-sm hover:shadow-md",
							"transition-all duration-300"
						)}
					>
						复制
					</Button>
					<Popconfirm
						title="确定删除该服务吗？"
						onConfirm={() => handleDeleteService(record.id)}
						okText="确定"
						cancelText="取消"
					>
						<Button
							type="primary"
							icon={<DeleteOutlined />}
							danger
							className={clsx(
								"px-3 h-8",
								"rounded-lg",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<PageHeader
				title="服务管理"
				statistics={{
					label: "共",
					value: `${total} 个服务`
				}}
				actionButton={{
					text: "新增服务",
					icon: <PlusOutlined />,
					onClick: handleCreateService
				}}
			/>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full overflow-x-auto">
				<Table<RemoteService>
					loading={initLoading}
					columns={columns}
					dataSource={services}
					rowKey="id"
					scroll={{ x: "max-content" }}
					pagination={{
						current: pagination.page,
						pageSize: pagination.pageSize,
						total: total,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`,
						onChange: (page, pageSize) => {
							setPagination({
								...pagination,
								page,
								pageSize
							});
							fetchServices(page, pageSize);
						}
					}}
				/>
			</div>
			<ServiceModal
				ref={serviceModalRef}
				onSave={() => {
					fetchServices(pagination.page, pagination.pageSize);
				}}
			/>
			<InterfaceListModal ref={interfaceModalRef} interfaces={selectedService?.interfaces || []} />
			<ConfigListModal ref={configModalRef} configs={selectedService?.configs || []} />
		</div>
	);
};

export default ServiceManage;
