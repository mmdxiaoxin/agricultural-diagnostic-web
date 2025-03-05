import { AiService, AiServiceConfig } from "@/api/interface";
import { Form, Input, InputNumber, Popconfirm, Table, TableProps, Typography } from "antd";
import React, { useState } from "react";

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
							message: `请输入 ${title}!`
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
	const [configs, setConfigs] = useState<AiServiceConfig[]>(service?.aiServiceConfigs || []);
	const [form] = Form.useForm();

	const [editingKey, setEditingKey] = useState(0);
	const isEditing = (record: AiServiceConfig) => record.configId === editingKey;

	const edit = (record: Partial<AiServiceConfig>) => {
		form.setFieldsValue({ configKey: "", configValue: "", ...record });
		setEditingKey(record.configId as number);
	};

	const save = async (key: number) => {
		try {
			const row = (await form.validateFields()) as AiServiceConfig;

			const newData = [...configs];
			const index = newData.findIndex(item => key === item.configId);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				setConfigs(newData);
				setEditingKey(0);
			} else {
				newData.push(row);
				setConfigs(newData);
				setEditingKey(0);
			}
		} catch (errInfo) {
			console.log("Validate Failed:", errInfo);
		}
	};

	const cancel = () => {
		setEditingKey(0);
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
			title: "operation",
			dataIndex: "operation",
			render: (_: any, record: AiServiceConfig) => {
				const editable = isEditing(record);
				return editable ? (
					<span>
						<Typography.Link onClick={() => save(record.configId)} style={{ marginInlineEnd: 8 }}>
							保存
						</Typography.Link>
						<Popconfirm title="确认取消编辑？" onConfirm={cancel}>
							<a>取消</a>
						</Popconfirm>
					</span>
				) : (
					<Typography.Link disabled={editingKey !== 0} onClick={() => edit(record)}>
						编辑
					</Typography.Link>
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
		<div>
			<Typography.Title type="secondary" level={5} style={{ whiteSpace: "nowrap" }}>
				{service?.serviceName}
			</Typography.Title>
			<Form form={form} component={false}>
				<Table<AiServiceConfig>
					components={{
						body: { cell: EditableCell }
					}}
					bordered
					dataSource={configs}
					columns={mergedColumns}
					rowClassName="absolute top-[100%]"
					pagination={false}
				/>
			</Form>
		</div>
	);
};

export default ServiceDetail;
