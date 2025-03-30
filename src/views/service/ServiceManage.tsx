import { RemoteService } from "@/api/interface/service";
import { copyRemote, getRemotesList, remoteRemote } from "@/api/modules";
import ConfigListModal, { ConfigListModalRef } from "@/components/Modal/ConfigListModal";
import InterfaceListModal, { InterfaceListModalRef } from "@/components/Modal/InterfaceListModal";
import ServiceModal, { ServiceModalRef } from "@/components/Modal/ServiceModal";
import { StatusMapper } from "@/constants";
import {
	CodepenOutlined,
	CopyOutlined,
	DeleteOutlined,
	PlusOutlined,
	SearchOutlined,
	SettingOutlined
} from "@ant-design/icons/lib/icons";
import { Button, Input, message, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
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
	const [searchText, setSearchText] = useState("");
	const [selectedService, setSelectedService] = useState<RemoteService | null>(null);
	const navigate = useNavigate();

	const fetchServices = async (page: number = 1, pageSize: number = 10) => {
		const response = await getRemotesList({ page, pageSize });
		if (response.code === 200 && response.data) {
			setServices(response.data.list || []);
			setTotal(response.data.total || 0);
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

	const filteredServices = services.filter(service =>
		service.serviceName.toLowerCase().includes(searchText.toLowerCase())
	);

	const columns: ColumnsType<RemoteService> = [
		{
			title: "服务名称",
			dataIndex: "serviceName",
			key: "serviceName",
			width: 200,
			ellipsis: true,
			render: text => (
				<Tooltip title={text}>
					<span className="font-medium text-gray-800">{text}</span>
				</Tooltip>
			)
		},
		{
			title: "服务类型",
			dataIndex: "serviceType",
			key: "serviceType",
			width: 120,
			render: text => (
				<Tag color="blue" className="px-2 py-0.5 rounded-md">
					{text}
				</Tag>
			)
		},
		{
			title: "服务描述",
			dataIndex: "description",
			key: "description",
			ellipsis: true,
			render: text => (
				<Tooltip title={text}>
					<span className="text-gray-600">{text || "-"}</span>
				</Tooltip>
			)
		},
		{
			title: "服务状态",
			dataIndex: "status",
			key: "status",
			width: 100,
			render: text => (
				<Tag
					color={text === "active" ? "success" : text === "inactive" ? "error" : "warning"}
					className="px-2 py-0.5 rounded-md"
				>
					{StatusMapper[text as RemoteService["status"]]}
				</Tag>
			)
		},
		{
			title: "配置数量",
			key: "configCount",
			width: 100,
			render: (_, record) => (
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
			)
		},
		{
			title: "接口数量",
			key: "interfaceCount",
			width: 100,
			render: (_, record) => (
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
			)
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			width: 180,
			render: text => <span className="text-gray-500">{new Date(text).toLocaleString()}</span>
		},
		{
			title: "操作",
			key: "actions",
			align: "center",
			width: 280,
			fixed: "right",
			render: (_, record) => (
				<Space size="middle">
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
						/>
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
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">服务管理</h2>
						<p className="text-gray-500">共 {total} 个服务</p>
					</div>
					<div className="flex items-center gap-4">
						<Input
							placeholder="搜索服务..."
							prefix={<SearchOutlined className="text-gray-400" />}
							value={searchText}
							onChange={e => setSearchText(e.target.value)}
							className={clsx(
								"w-64",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleCreateService}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							新增服务
						</Button>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
				<Table<RemoteService>
					columns={columns}
					dataSource={filteredServices}
					rowKey="serviceId"
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
