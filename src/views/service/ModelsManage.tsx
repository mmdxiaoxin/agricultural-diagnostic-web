import { RemoteService } from "@/api/interface/service";
import { callRemoteInterface, getRemotes } from "@/api/modules/service";
import ModelDetailModal, { ModelDetailModalRef } from "@/components/Modal/ModelDetailModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import type { ModelConfig } from "@/typings/model";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Form, message, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

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

	const modelDetailModalRef = useRef<ModelDetailModalRef>(null);

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

	const handleViewModel = (record: ModelConfig) => {
		modelDetailModalRef.current?.open(record);
	};

	const columns: ColumnsType<ModelConfig> = [
		{
			title: "模型名称",
			dataIndex: "name",
			key: "name",
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
			render: (text: string) => <TextCell className="text-gray-800 font-medium" text={text} />
		},
		{
			title: "模型类型",
			dataIndex: "model_type",
			key: "model_type",
			responsive: ["sm", "md", "lg", "xl", "xxl"],
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
			responsive: ["md", "lg", "xl", "xxl"],
			render: (text: string) => <TextCell text={`v${text}`} className="text-gray-600" />
		},
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			ellipsis: true,
			responsive: ["lg", "xl", "xxl"],
			render: (text: string) => <TextCell text={text || "-"} className="text-gray-600" />
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			responsive: ["lg", "xl", "xxl"],
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			responsive: ["lg", "xl", "xxl"],
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			responsive: ["xl", "xxl"],
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"} className="px-3 py-1 rounded-full">
					{status === "active" ? "已激活" : "未激活"}
				</Tag>
			)
		},
		{
			title: "操作",
			key: "action",
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
			render: (_, record) => (
				<Space wrap className="flex flex-col sm:flex-row">
					<Button type="link" onClick={() => handleViewModel(record)}>
						查看
					</Button>
				</Space>
			)
		}
	];

	const expandable = {
		expandedRowRender: (record: ModelConfig) => (
			<div className="p-4 bg-gray-50 rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Object.entries(record.parameters).map(([key, value]) => (
						<div key={key} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
							<div className="text-sm font-medium text-gray-500 mb-1">{key}</div>
							<div className="text-base font-mono text-gray-800">
								{typeof value === "boolean" ? (
									<Tag color={value ? "green" : "red"}>{value ? "true" : "false"}</Tag>
								) : (
									value?.toString() || "-"
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		),
		expandIcon: (props: any) => (
			<Button
				type="text"
				onClick={e => props.onExpand(props.record, e)}
				className={clsx(
					"transition-all duration-300",
					props.expanded ? "text-blue-500" : "text-gray-400"
				)}
			>
				{props.expanded ? "收起" : "展开"}
			</Button>
		)
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

				<ModelDetailModal ref={modelDetailModalRef} />

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
						expandable={expandable}
					/>
				</div>
			</div>
		</div>
	);
};

export default ModelsManage;
