import { AiService, AiServiceConfig } from "@/api/interface";
import { addConfigs, getService } from "@/api/modules";
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

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
	const [configs, setConfigs] = useState<AiServiceConfig[]>([]);
	const [form] = Form.useForm();

	const fetchServiceDetail = async () => {
		if (service?.serviceId) {
			const response = await getService(service.serviceId);
			setConfigs(response.data?.aiServiceConfigs || []);
		}
	};

	useEffect(() => {
		fetchServiceDetail();
	}, [service]);

	const [editingKey, setEditingKey] = useState(0);
	const isEditing = (record: AiServiceConfig) => record.configId === editingKey;

	const edit = (record: Partial<AiServiceConfig>) => {
		form.setFieldsValue({ configKey: "", configValue: "", ...record });
		setEditingKey(record.configId as number);
	};

	const save = async (key: number) => {
		try {
			const row = (await form.validateFields()) as AiServiceConfig;

			const newConfigs = [...configs];
			const index = newConfigs.findIndex(item => key === item.configId);
			if (index > -1) {
				const item = newConfigs[index];
				newConfigs.splice(index, 1, {
					...item,
					...row
				});
				setConfigs(newConfigs);
				setEditingKey(0);
			} else {
				newConfigs.push(row);
				setConfigs(newConfigs);
				setEditingKey(0);
			}
		} catch (errInfo) {
			console.log("Validate Failed:", errInfo);
		}
	};

	const cancel = () => {
		setEditingKey(0);
	};

	// 新增功能
	const addConfig = () => {
		const newConfig: AiServiceConfig = {
			configId: Date.now(),
			configKey: "",
			configValue: ""
		} as AiServiceConfig;
		setConfigs([...configs, newConfig]);
		setEditingKey(newConfig.configId);
	};

	// 删除功能
	const deleteConfig = (key: number) => {
		setConfigs(configs.filter(config => config.configId !== key));
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
						<Button type="primary" onClick={() => save(record.configId)}>
							保存
						</Button>
						<Popconfirm title="确认取消编辑？" onConfirm={cancel}>
							<Button>取消</Button>
						</Popconfirm>
					</Space>
				) : (
					<Space>
						<Button type="primary" disabled={editingKey !== 0} onClick={() => edit(record)}>
							编辑
						</Button>
						<Popconfirm title="确认删除此项？" onConfirm={() => deleteConfig(record.configId)}>
							<Button type="primary" danger>
								删除
							</Button>
						</Popconfirm>
					</Space>
				);
			}
		}
	];

	const handleFinish = async () => {
		try {
			// 处理掉configId
			const filteredConfigs = configs.map(config => {
				const { configId, ...rest } = config;
				return rest;
			});
			if (service?.serviceId) {
				await addConfigs(service.serviceId as number, { configs: filteredConfigs });
				message.success("保存成功！");
			}
		} catch (error) {}
	};

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
				<Button type="primary" onClick={addConfig} disabled={editingKey !== 0}>
					新增配置
				</Button>
				<Button type="primary" onClick={handleFinish} disabled={configs.length === 0}>
					保存提交
				</Button>
			</Space>
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
				/>
			</Form>
		</div>
	);
};

export default ServiceDetail;
