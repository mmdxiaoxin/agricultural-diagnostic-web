import { RemoteService } from "@/api/interface/service";
import { copyRemote, remoteRemote, getRemotesList } from "@/api/modules";
import ServiceModal, { ServiceModalRef } from "@/components/Modal/ServiceModal";
import QuickCopy from "@/components/Table/QuickCopy";
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
	const [services, setServices] = useState<RemoteService[]>([]);
	const serviceModalRef = useRef<ServiceModalRef>(null);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
	const [total, setTotal] = useState(0);
	const [searchText, setSearchText] = useState("");
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

	const filteredServices = services.filter(service =>
		service.serviceName.toLowerCase().includes(searchText.toLowerCase())
	);

	const columns: ColumnsType<RemoteService> = [
		{
			title: "服务名称",
			dataIndex: "serviceName",
			key: "serviceName"
		},
		{
			title: "服务类型",
			dataIndex: "serviceType",
			key: "serviceType",
			render: text => <Tag>{text}</Tag>
		},
		{
			title: "服务状态",
			dataIndex: "status",
			key: "status",
			render: text => (
				<Tag color={text === "active" ? "success" : text === "inactive" ? "error" : "warning"}>
					{StatusMapper[text as RemoteService["status"]]}
				</Tag>
			)
		},
		{
			title: "服务URL",
			dataIndex: "endpointUrl",
			key: "endpointUrl",
			render: text => <QuickCopy text={text} />
		},
		{
			title: "操作",
			key: "actions",
			align: "center",
			render: (_, record) => (
				<Space>
					<Tooltip title="快速配置">
						<Button
							onClick={() => handleQuickConfig(record)}
							type="primary"
							icon={<SettingOutlined />}
							className={clsx(
								"px-4 h-8",
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
							const {
								aiServiceAccessLogs,
								aiServiceConfigs,
								aiServiceLogs,
								createdAt,
								updatedAt,
								...serviceData
							} = record;
							handleEditService(serviceData);
						}}
						type="primary"
						icon={<CodepenOutlined />}
						className={clsx(
							"px-4 h-8",
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
							"px-4 h-8",
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
								"px-4 h-8",
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
		</div>
	);
};

export default ServiceManage;
