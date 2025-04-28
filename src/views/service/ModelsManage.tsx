import { RemoteService } from "@/api/interface/service";
import { callRemoteInterface, getRemotes } from "@/api/modules/service";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import type { ModelConfig } from "@/typings/model";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Form, message, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const ModelsManage = () => {
	const [models, setModels] = useState<ModelConfig[]>([]);
	const [services, setServices] = useState<RemoteService[]>([]);
	const [selectedService, setSelectedService] = useState<number>();
	const [selectedInterface, setSelectedInterface] = useState<number>();
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});

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
			width: 150,
			fixed: "left",
			render: (text: string) => (
				<TextCell className="text-gray-800 font-medium" text={text} maxLength={10} />
			)
		},
		{
			title: "模型类型",
			dataIndex: "model_type",
			key: "model_type",
			width: 120,
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
			width: 100,
			render: (text: string) => <TextCell text={`v${text}`} className="text-gray-600" />
		},
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			width: 200,
			ellipsis: true,
			render: (text: string) => <TextCell text={text || "-"} className="text-gray-600" />
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			width: 160,
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			width: 160,
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			width: 100,
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"} className="px-3 py-1 rounded-full">
					{status === "active" ? "已激活" : "未激活"}
				</Tag>
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
				title="模型预览"
				statistics={{
					label: "共",
					value: `${models.length} 个模型`
				}}
			/>

			<div className="flex flex-col gap-4">
				<Form
					form={form}
					className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
					layout="vertical"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<Form.Item
							label="诊断服务"
							name="service"
							rules={[{ required: true, message: "请选择诊断服务" }]}
						>
							<Select
								placeholder="请选择服务"
								onChange={value => {
									setSelectedService(value);
									setSelectedInterface(undefined);
									form.setFieldValue("interface", undefined);
								}}
								options={services.map(service => ({
									label: service.serviceName,
									value: service.id
								}))}
							/>
						</Form.Item>

						<Form.Item
							label="接口"
							name="interface"
							rules={[{ required: true, message: "请选择接口" }]}
						>
							<Select
								placeholder="请选择接口"
								disabled={!selectedService}
								onChange={value => setSelectedInterface(value)}
								options={services
									.find(service => service.id === selectedService)
									?.interfaces.map(inter => ({
										label: inter.name,
										value: inter.id
									}))}
							/>
						</Form.Item>

						<Form.Item label=" ">
							<Button
								type="primary"
								icon={<DownloadOutlined />}
								onClick={handleFetchModels}
								loading={loading}
								className={clsx(
									"w-full md:w-auto",
									"h-10",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center justify-center gap-2"
								)}
							>
								获取模型
							</Button>
						</Form.Item>
					</div>
				</Form>

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
						scroll={{ x: "max-content" }}
						className="transition-all duration-300"
					/>
				</div>
			</div>
		</div>
	);
};

export default ModelsManage;
