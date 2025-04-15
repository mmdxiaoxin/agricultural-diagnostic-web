import type { RemoteInterface, RemoteInterfaceConfig } from "@/api/interface/service";
import { RemoteService } from "@/api/interface/service";
import { getRemotes } from "@/api/modules/service";
import ModelManageModal, { ModelManageModalRef } from "@/components/Modal/ModelManageModal";
import { useAppSelector } from "@/hooks";
import type { ModelConfig, ModelResponse } from "@/typings/model";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Space, Table, Tag, Typography } from "antd";
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
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const modalRef = useRef<ModelManageModalRef>(null);
	const { token } = useAppSelector(state => state.auth);

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

	// 构建完整的请求URL
	const buildRequestUrl = (interfaceConfig: RemoteInterface): string => {
		const { url, config } = interfaceConfig;
		const { prefix = "", path = "" } = config || {};

		return `${url}${prefix}${path}`;
	};

	// 构建请求配置
	const buildRequestConfig = (config: RemoteInterfaceConfig): RequestInit => {
		const requestConfig: RequestInit = {
			method: config.method || "GET",
			headers: {
				"Content-Type": config.contentType || "application/json",
				Authorization: `Bearer ${token}`,
				// 添加跨域相关头
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization"
			},
			credentials: "include" // 允许携带认证信息
		};

		// 添加其他配置
		if (config.headers) {
			requestConfig.headers = {
				...requestConfig.headers,
				...config.headers
			};
		}

		if (config.timeout) {
			requestConfig.signal = AbortSignal.timeout(config.timeout);
		}

		return requestConfig;
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

			// 构建请求URL和配置
			const requestUrl = buildRequestUrl(selectedInterface);
			const requestConfig = buildRequestConfig(selectedInterface.config || {});

			// 调用接口获取模型数据
			const response = await fetch(requestUrl, requestConfig);

			if (!response.ok) {
				throw new Error("获取模型数据失败");
			}

			// 根据配置的responseType处理响应
			const responseType = selectedInterface.config?.responseType || "json";
			let data: ModelResponse;

			switch (responseType) {
				case "json":
					data = await response.json();
					break;
				case "text":
					data = JSON.parse(await response.text());
					break;
				default:
					throw new Error(`不支持的响应类型: ${responseType}`);
			}

			// 转换数据格式
			const modelList: ModelConfig[] = [];
			Object.entries(data.data.versions).forEach(([modelName, versions]) => {
				versions.forEach(version => {
					modelList.push({
						id: version.version_id.toString(),
						name: modelName,
						type: version.model_type,
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
			title: "类型",
			dataIndex: "type",
			key: "type",
			render: (type: string) => (
				<Tag
					color={type === "yolo" ? "blue" : type === "resnet" ? "green" : "purple"}
					className="px-3 py-1 rounded-full"
				>
					{type.toUpperCase()}
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

	// 过滤数据
	const filteredData = models.filter(item => {
		const searchLower = searchText.toLowerCase();
		return (
			item.name.toLowerCase().includes(searchLower) ||
			item.type.toLowerCase().includes(searchLower) ||
			item.version.toLowerCase().includes(searchLower)
		);
	});

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
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">模型管理</h2>
						<p className="text-gray-500">共 {models.length} 个模型</p>
					</div>
					<div className="flex items-center gap-4">
						<Input
							placeholder="搜索模型..."
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
							onClick={() => modalRef.current?.open()}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							添加模型
						</Button>
					</div>
				</div>
			</div>

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
						dataSource={filteredData}
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
