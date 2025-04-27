import { RemoteService } from "@/api/interface/service";
import { callRemoteInterface, getRemotes } from "@/api/modules/service";
import ModelManageModal, { ModelManageModalRef } from "@/components/Modal/ModelManageModal";
import PageHeader from "@/components/PageHeader";
import type { ModelConfig } from "@/typings/model";
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const { Text } = Typography;

const ModelsManage = () => {
	const [models, setModels] = useState<ModelConfig[]>([]);
	const [services, setServices] = useState<RemoteService[]>([]);
	const [selectedService, setSelectedService] = useState<number>();
	const [selectedInterface, setSelectedInterface] = useState<number>();
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const modalRef = useRef<ModelManageModalRef>(null);

	// 获取服务列表
	const fetchServices = async () => {
		setLoading(true);
		try {
			const res = await getRemotes();
			setServices(res.data || []);
		} catch (error) {
			message.error("获取服务列表失败");
		} finally {
			setLoading(false);
		}
	};

	// 获取模型列表
	const fetchModels = async (serviceId: number, interfaceId: number) => {
		setLoading(true);
		try {
			const selectedService = services.find(s => s.id === serviceId);
			const selectedInterface = selectedService?.interfaces.find(i => i.id === interfaceId);

			if (!selectedInterface) {
				message.error("接口不存在");
				return;
			}

			const response = await callRemoteInterface(serviceId, interfaceId);

			// 转换数据格式
			const modelList: ModelConfig[] = [];
			Object.entries(response.data.versions).forEach(([modelName, versions]) => {
				(versions as any[]).forEach((version: any) => {
					modelList.push({
						id: version.version_id.toString(),
						name: modelName,
						model_type: version.model_type,
						model_version: version.model_version,
						version: version.version,
						description: version.description,
						weightPath: version.file_path,
						configPath: "",
						parameters: {
							confidence: version.parameters.conf || 0.5,
							iou: version.parameters.iou || 0.5,
							batchSize: 1,
							...version.parameters
						},
						status: "active",
						createdAt: version.created_at,
						updatedAt: version.updated_at
					});
				});
			});

			setModels(modelList);
			setPagination(prev => ({ ...prev, total: modelList.length }));
			message.success("获取模型数据成功");
		} catch (error) {
			console.error("获取模型数据失败:", error);
			message.error("获取模型列表失败");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchServices();
	}, []);

	const handleFetchModels = () => {
		if (!selectedService || !selectedInterface) {
			message.warning("请先选择服务和接口");
			return;
		}
		fetchModels(selectedService, selectedInterface);
	};

	const columns: ColumnsType<ModelConfig> = [
		{
			title: "模型名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <Text className="text-gray-800 font-medium">{text}</Text>
		},
		{
			title: "模型类型",
			dataIndex: "model_type",
			key: "model_type",
			render: (type, record) => (
				<Tag
					color={type === "yolo" ? "blue" : type === "resnet" ? "green" : "purple"}
					className="px-3 py-1 rounded-full"
				>
					{`${type.toUpperCase()}${record.model_version.toUpperCase()}`}
				</Tag>
			)
		},
		{
			title: "版本",
			dataIndex: "version",
			key: "version",
			render: (text: string) => <Text className="text-gray-600">v{text}</Text>
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (text: string) => (
				<Text className="text-gray-600">{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</Text>
			)
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"} className="px-3 py-1 rounded-full">
					{status === "active" ? "已激活" : "未激活"}
				</Tag>
			)
		},
		{
			title: "操作",
			key: "action",
			fixed: "right" as const,
			render: (_: any, record: ModelConfig) => (
				<Space>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => modalRef.current?.open(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						编辑
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record)}
						className="text-red-500 hover:text-red-600"
					>
						删除
					</Button>
				</Space>
			)
		}
	];

	const handleDelete = (model: ModelConfig) => {
		Modal.confirm({
			title: "确认删除",
			content: `确定要删除模型 ${model.name} 吗？`,
			onOk: () => {
				setModels(models.filter(m => m.id !== model.id));
				message.success("删除成功");
			}
		});
	};

	const handleModalOk = (values: any) => {
		if (values.id) {
			setModels(models.map(m => (m.id === values.id ? { ...m, ...values } : m)));
			message.success("更新成功");
		} else {
			setModels([
				...models,
				{ ...values, id: Date.now().toString(), createdAt: new Date().toISOString() }
			]);
			message.success("添加成功");
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
				"overflow-y-auto"
			)}
		>
			<PageHeader
				title="模型管理"
				statistics={{
					label: "共",
					value: `${models.length} 个模型`
				}}
				actionButton={{
					text: "添加模型",
					icon: <PlusOutlined />,
					onClick: () => modalRef.current?.open()
				}}
			/>

			<div className="flex flex-col gap-4">
				<Space className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<Text>诊断服务选择：</Text>
					<Select
						className="w-64"
						value={selectedService}
						onChange={value => {
							setSelectedService(value);
							setSelectedInterface(undefined);
						}}
						placeholder="请选择服务"
					>
						{services.map(service => (
							<Select.Option key={service.id} value={service.id}>
								{service.serviceName}
							</Select.Option>
						))}
					</Select>
					{selectedService && (
						<>
							<Text>接口选择：</Text>
							<Select
								className="w-64"
								value={selectedInterface}
								onChange={setSelectedInterface}
								placeholder="请选择接口"
							>
								{services
									.find(service => service.id === selectedService)
									?.interfaces.map(inter => (
										<Select.Option key={inter.id} value={inter.id}>
											{inter.name}
										</Select.Option>
									))}
							</Select>
							<Button
								type="primary"
								icon={<DownloadOutlined />}
								onClick={handleFetchModels}
								loading={loading}
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center gap-2"
								)}
							>
								获取模型
							</Button>
						</>
					)}
				</Space>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<Table
						columns={columns}
						dataSource={models}
						rowKey="id"
						pagination={{
							...pagination,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: total => `共 ${total} 项`,
							className: "mt-4",
							onChange: (page, pageSize) => {
								setPagination({ ...pagination, current: page, pageSize });
							}
						}}
						loading={loading}
						scroll={{ x: true }}
						className="transition-all duration-300"
					/>
				</div>
			</div>

			<ModelManageModal ref={modalRef} onOk={handleModalOk} />
		</div>
	);
};

export default ModelsManage;
