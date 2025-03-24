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
	Typography
} from "antd";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

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

	// 检查是否有未保存的更改
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
		// 如果是新增的配置项（configId 大于当前时间戳减去一天），则从列表中移除
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
				message.success("提交成功");
				onSave?.(service);
				fetchServiceDetail();
			}
		} catch (error) {
			message.error("提交失败");
		} finally {
			setSaveLoading(false);
		}
	};

	const columns = [
		{
			title: "配置项键名",
			dataIndex: "configKey",
			editable: true
		},
		{
			title: "配置项键值",
			dataIndex: "configValue",
			editable: true
		},
		{
			title: "操作",
			dataIndex: "operation",
			render: (_: any, record: AiServiceConfig) => {
				const editable = isEditing(record);
				return editable ? (
					<Space>
						<Button type="primary" onClick={() => handleSaveRow(record.configId)}>
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
		<div className={clsx("w-full h-full", "p-4")}>
			<Typography.Title level={4}>{service?.serviceName}</Typography.Title>
			<Space className="mb-4">
				<Button type="primary" onClick={handleAddRow} disabled={editingKey !== null}>
					新增配置
				</Button>
				<Button
					type="primary"
					onClick={handleSubmit}
					disabled={initLoading || saveLoading}
					loading={saveLoading}
				>
					{hasUnsavedChanges() ? "保存提交*" : "保存提交"}
				</Button>
			</Space>
			{hasUnsavedChanges() && (
				<Typography.Text type="warning" className="block mb-4">
					您有未保存的更改，请点击"保存提交"按钮保存更改
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
				/>
			</Form>
		</div>
	);
};

export default ServiceDetail;
