import { AiService, AiServiceConfig } from "@/api/interface";
import { getServiceDetail, updateConfigs } from "@/api/modules";
import {
	Button,
	Form,
	Input,
	InputNumber,
	message,
	Popconfirm,
	Space,
	Table,
	TableProps,
	Typography,
	Card,
	Tag,
	Tooltip
} from "antd";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { StatusMapper } from "@/constants";
import { PlusOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
	editing: boolean;
	dataIndex: string;
	title: any;
	inputType: "number" | "text";
	record: AiServiceConfig;
	index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
	editing,
	dataIndex,
	title,
	inputType,
	record,
	index,
	children,
	...restProps
}) => {
	const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{ margin: 0 }}
					rules={[
						{
							required: true,
							message: `请输入${title}!`
						}
					]}
				>
					{inputNode}
				</Form.Item>
			) : (
				children
			)}
		</td>
	);
};

export type ServiceDetailProps = {
	service?: AiService;
	onSave?: (service: AiService) => void;
};

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onSave }) => {
	const [configs, setConfigs] = useState<AiServiceConfig[]>([]);
	const [originalConfigs, setOriginalConfigs] = useState<AiServiceConfig[]>([]);
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState<number | null>(null);
	const [initLoading, setInitLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);

	const fetchServiceDetail = async () => {
		if (service?.serviceId) {
			try {
				setInitLoading(true);
				const response = await getServiceDetail(service.serviceId);
				const newConfigs = response.data?.aiServiceConfigs || [];
				setConfigs(newConfigs);
				setOriginalConfigs(newConfigs);
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

	const isEditing = (record: AiServiceConfig) => record.configId === editingKey;

	const handleEdit = (record: AiServiceConfig) => {
		form.setFieldsValue({ ...record });
		setEditingKey(record.configId);
	};

	const hasUnsavedChanges = () => {
		if (configs.length !== originalConfigs.length) return true;
		return configs.some((config, index) => {
			const original = originalConfigs[index];
			return config.configKey !== original.configKey || config.configValue !== original.configValue;
		});
	};

	const handleSaveRow = async (key: number) => {
		try {
			const row = await form.validateFields();
			const newConfigs = configs.map(item => {
				if (item.configId === key) {
					return { ...item, ...row };
				}
				return item;
			});
			setConfigs(newConfigs);
			setEditingKey(null);
		} catch (errInfo) {
			console.log("Validate Failed:", errInfo);
		}
	};

	const handleCancelRow = () => {
		const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		if (editingKey && editingKey > oneDayAgo) {
			setConfigs(configs.filter(config => config.configId !== editingKey));
		}
		setEditingKey(null);
		form.resetFields();
	};

	const handleAddRow = () => {
		const newConfig: AiServiceConfig = {
			configId: Date.now(),
			configKey: "",
			configValue: "",
			service: service || ({} as AiService),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		setConfigs([...configs, newConfig]);
		setEditingKey(newConfig.configId);
	};

	const handleDeleteRow = async (key: number) => {
		try {
			const newConfigs = configs.filter(config => config.configId !== key);
			setConfigs(newConfigs);
		} catch (error) {
			message.error("删除失败");
		}
	};

	const handleSubmit = async () => {
		try {
			setSaveLoading(true);
			if (service?.serviceId) {
				const filteredConfigs = configs.map(({ configId, ...rest }) => rest);
				await updateConfigs(service.serviceId, { configs: filteredConfigs });
				message.success("保存成功");
				onSave?.(service);
				fetchServiceDetail();
			}
		} catch (error) {
			message.error("保存失败");
		} finally {
			setSaveLoading(false);
		}
	};

	const columns = [
		{
			title: "配置项键名",
			dataIndex: "configKey",
			editable: true,
			width: "40%"
		},
		{
			title: "配置项键值",
			dataIndex: "configValue",
			editable: true,
			width: "40%"
		},
		{
			title: "操作",
			dataIndex: "operation",
			width: "20%",
			render: (_: any, record: AiServiceConfig) => {
				const editable = isEditing(record);
				return editable ? (
					<Space>
						<Button
							type="primary"
							onClick={() => handleSaveRow(record.configId)}
							className="bg-blue-500 hover:bg-blue-600 border-none"
						>
							保存
						</Button>
						<Popconfirm title="确认取消编辑？" onConfirm={handleCancelRow}>
							<Button>取消</Button>
						</Popconfirm>
					</Space>
				) : (
					<Space>
						<Button
							type="primary"
							disabled={editingKey !== null}
							onClick={() => handleEdit(record)}
							className="bg-blue-500 hover:bg-blue-600 border-none"
						>
							编辑
						</Button>
						<Popconfirm title="确认删除此项？" onConfirm={() => handleDeleteRow(record.configId)}>
							<Button type="primary" danger>
								删除
							</Button>
						</Popconfirm>
					</Space>
				);
			}
		}
	];

	const mergedColumns: TableProps<AiServiceConfig>["columns"] = columns.map(col => {
		if (!col.editable) {
			return col;
		}
		return {
			...col,
			onCell: (record: AiServiceConfig) => ({
				record,
				inputType: "text",
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record)
			})
		};
	});

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
						<Space>
							<Tooltip title="刷新配置">
								<Button
									icon={<ReloadOutlined />}
									onClick={fetchServiceDetail}
									loading={initLoading}
									className="hover:bg-gray-100"
								/>
							</Tooltip>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={handleAddRow}
								disabled={editingKey !== null}
								className="bg-blue-500 hover:bg-blue-600 border-none"
							>
								新增配置
							</Button>
							<Button
								type="primary"
								icon={<SaveOutlined />}
								onClick={handleSubmit}
								disabled={initLoading || saveLoading}
								loading={saveLoading}
								className={clsx(
									"bg-blue-500 hover:bg-blue-600 border-none",
									hasUnsavedChanges() && "animate-pulse"
								)}
							>
								{hasUnsavedChanges() ? "保存更改*" : "保存更改"}
							</Button>
						</Space>
					</div>
				}
			>
				{hasUnsavedChanges() && (
					<Typography.Text type="warning" className="block mb-4">
						您有未保存的更改，请点击"保存更改"按钮保存
					</Typography.Text>
				)}
				<Form form={form} component={false}>
					<Table<AiServiceConfig>
						components={{
							body: { cell: EditableCell }
						}}
						bordered
						dataSource={configs}
						columns={mergedColumns}
						rowClassName="editable-row"
						pagination={false}
						loading={initLoading}
						className="rounded-lg"
					/>
				</Form>
			</Card>
		</div>
	);
};

export default ServiceDetail;
