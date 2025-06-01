import { RemoteInterface } from "@/api/interface";
import { createRemoteInterface, updateRemoteInterface } from "@/api/modules/service";
import {
	Button,
	Divider,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Select,
	Space,
	Table,
	TableProps,
	Tooltip,
	Tour
} from "antd";
import type { TourProps } from "antd";
import { FileTextOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { forwardRef, useImperativeHandle, useState, useRef } from "react";

export type InterfaceModalProps = {
	onSave?: (values: any) => void;
	onCancel?: () => void;
};

export type InterfaceModalRef = {
	open: (mode: "create" | "edit", values?: RemoteInterface, serviceId?: number) => void;
	close: () => void;
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
	editing: boolean;
	dataIndex: string;
	title: any;
	inputType: "text";
	record: { key: string; value: string };
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
	const inputNode = <Input />;

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

const InterfaceModal = forwardRef<InterfaceModalRef, InterfaceModalProps>(
	({ onCancel, onSave }, ref) => {
		const [form] = Form.useForm();
		const [isModalVisible, setIsModalVisible] = useState(false);
		const [modalMode, setModalMode] = useState<"create" | "edit">("create");
		const [editingKey, setEditingKey] = useState<string | null>(null);
		const [configs, setConfigs] = useState<{ key: string; value: string }[]>([]);
		const [currentServiceId, setCurrentServiceId] = useState<number>();

		// Tour 相关状态
		const [tourOpen, setTourOpen] = useState<boolean>(false);
		const nameRef = useRef<HTMLDivElement>(null);
		const typeRef = useRef<HTMLDivElement>(null);
		const urlRef = useRef<HTMLDivElement>(null);
		const descriptionRef = useRef<HTMLDivElement>(null);
		const configTableRef = useRef<HTMLDivElement>(null);
		const addConfigRef = useRef<HTMLButtonElement>(null);

		// Tour 步骤配置
		const steps: TourProps["steps"] = [
			{
				title: "接口名称",
				description: "输入接口的名称，用于标识不同的接口",
				target: () => nameRef.current as HTMLElement
			},
			{
				title: "接口类型",
				description: "选择接口的类型，支持 HTTP、HTTPS、WebSocket 等多种协议",
				target: () => typeRef.current as HTMLElement
			},
			{
				title: "接口地址",
				description: "输入接口的访问地址，例如：https://api.example.com/v1",
				target: () => urlRef.current as HTMLElement
			},
			{
				title: "接口描述",
				description: "添加接口的详细描述，帮助其他用户理解接口的用途",
				target: () => descriptionRef.current as HTMLElement
			},
			{
				title: "添加配置项",
				description: "点击此按钮添加新的配置项",
				target: () => addConfigRef.current as HTMLElement
			},
			{
				title: "配置项列表",
				description: "在这里管理接口的配置项，支持添加、编辑和删除操作",
				target: () => configTableRef.current as HTMLElement
			}
		];

		useImperativeHandle(
			ref,
			() => ({
				open: handleOpen,
				close: handleClose
			}),
			[]
		);

		const handleOpen = (mode: "create" | "edit", values?: RemoteInterface, serviceId?: number) => {
			setModalMode(mode);
			setIsModalVisible(true);
			setCurrentServiceId(serviceId);
			if (values) {
				form.setFieldsValue(values);
				// 将 Record<string, string> 转换为数组格式
				const configArray = Object.entries(values.config || {}).map(([key, value]) => ({
					key,
					value
				}));
				setConfigs(configArray);
			} else {
				setConfigs([]);
			}
		};

		const handleClose = () => {
			setIsModalVisible(false);
			form.resetFields();
			setConfigs([]);
			setEditingKey(null);
			setCurrentServiceId(undefined);
			onCancel?.();
		};

		const handleSave = async (values: any) => {
			if (!currentServiceId) {
				message.error("服务ID不能为空");
				return;
			}

			try {
				// 将配置数组转换回 Record<string, string> 格式
				const configRecord = configs.reduce(
					(acc, { key, value }) => {
						acc[key] = value;
						return acc;
					},
					{} as Record<string, string>
				);

				const submitData = {
					...values,
					id: undefined,
					config: configRecord
				};

				if (modalMode === "create") {
					await createRemoteInterface(currentServiceId, submitData);
					message.success("创建成功");
				} else {
					await updateRemoteInterface(currentServiceId, values.id, submitData);
					message.success("更新成功");
				}

				onSave?.(submitData);
				handleClose();
			} catch (error) {
				message.error(modalMode === "create" ? "创建失败" : "更新失败");
				console.error("保存失败:", error);
			}
		};

		const isEditing = (record: { key: string; value: string }) => record.key === editingKey;

		const handleEdit = (record: { key: string; value: string }) => {
			form.setFieldsValue({ ...record });
			setEditingKey(record.key);
		};

		const handleSaveRow = async (key: string) => {
			try {
				const row = await form.validateFields();
				const newConfigs = configs.map(item => {
					if (item.key === key) {
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
			setConfigs(configs.filter(config => config.key !== editingKey));
			setEditingKey(null);
			// 只重置配置项相关的字段
			form.setFieldsValue({
				key: undefined,
				value: undefined
			});
		};

		const handleAddRow = () => {
			const newConfig = {
				key: `config_${Date.now()}`,
				value: ""
			};
			setConfigs([...configs, newConfig]);
			setEditingKey(newConfig.key);
		};

		const handleDeleteRow = (key: string) => {
			setConfigs(configs.filter(config => config.key !== key));
		};

		const columns = [
			{
				title: "配置项键名",
				dataIndex: "key",
				editable: true,
				width: "40%"
			},
			{
				title: "配置项键值",
				dataIndex: "value",
				editable: true,
				width: "40%"
			},
			{
				title: "操作",
				dataIndex: "operation",
				width: "20%",
				render: (_: any, record: { key: string; value: string }) => {
					const editable = isEditing(record);
					return editable ? (
						<Space>
							<Button type="primary" onClick={() => handleSaveRow(record.key)}>
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
							<Popconfirm title="确认删除此项？" onConfirm={() => handleDeleteRow(record.key)}>
								<Button type="primary" danger>
									删除
								</Button>
							</Popconfirm>
						</Space>
					);
				}
			}
		];

		const mergedColumns: TableProps<{ key: string; value: string }>["columns"] = columns.map(
			col => {
				if (!col.editable) {
					return col;
				}
				return {
					...col,
					onCell: (record: { key: string; value: string }) => ({
						record,
						inputType: "text",
						dataIndex: col.dataIndex,
						title: col.title,
						editing: isEditing(record)
					})
				};
			}
		);

		return (
			<Modal
				title={modalMode === "edit" ? "编辑接口" : "添加接口"}
				open={isModalVisible}
				onCancel={handleClose}
				footer={null}
				width={{
					xs: "95%",
					sm: "90%",
					md: "85%",
					lg: "80%",
					xl: "75%",
					xxl: "70%"
				}}
				className="interface-modal"
			>
				<Form form={form} onFinish={handleSave} layout="vertical">
					<div className="flex flex-col lg:flex-row gap-6">
						{/* 左侧基本信息 */}
						<div className="flex-1">
							<div className="mb-6">
								<h3 className="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
								<Form.Item name="id" hidden />
								<Form.Item
									label="接口名称"
									name="name"
									rules={[{ required: true, message: "请输入接口名称" }]}
								>
									<div ref={nameRef}>
										<Input placeholder="请输入接口名称" />
									</div>
								</Form.Item>

								<Form.Item
									label="接口类型"
									name="type"
									rules={[{ required: true, message: "请选择接口类型" }]}
								>
									<div ref={typeRef}>
										<Select placeholder="请选择接口类型">
											<Select.Option value="http">HTTP</Select.Option>
											<Select.Option value="https">HTTPS</Select.Option>
											<Select.Option value="ws">WebSocket</Select.Option>
											<Select.Option value="wss">WebSocket Secure</Select.Option>
											<Select.Option value="grpc">gRPC</Select.Option>
											<Select.Option value="graphql">GraphQL</Select.Option>
										</Select>
									</div>
								</Form.Item>

								<Form.Item label="接口地址" name="url">
									<div ref={urlRef}>
										<Input placeholder="请输入接口地址" />
									</div>
								</Form.Item>

								<Form.Item label="接口描述" name="description">
									<div ref={descriptionRef}>
										<Input.TextArea placeholder="请输入接口描述" rows={4} className="resize-none" />
									</div>
								</Form.Item>
							</div>

							<Divider className="lg:hidden" />

							<div className="flex justify-end">
								<Button type="primary" htmlType="submit">
									保存
								</Button>
							</div>
						</div>

						{/* 右侧配置表格 */}
						<div className="flex-1 lg:border-l lg:border-gray-100 lg:pl-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-800">接口配置</h3>
								<Space>
									<Tooltip title="使用帮助">
										<Button
											type="primary"
											icon={<QuestionCircleOutlined />}
											onClick={() => setTourOpen(true)}
										/>
									</Tooltip>
									<Button
										type="primary"
										onClick={handleAddRow}
										disabled={editingKey !== null}
										className="bg-blue-500 hover:bg-blue-600 border-none"
										ref={addConfigRef}
									>
										添加配置项
									</Button>
								</Space>
							</div>
							<div className="overflow-x-auto" ref={configTableRef}>
								<Table
									components={{
										body: { cell: EditableCell }
									}}
									bordered
									dataSource={configs}
									columns={mergedColumns}
									rowClassName="editable-row"
									pagination={false}
									className="rounded-lg"
									scroll={{ x: "max-content" }}
								/>
							</div>
						</div>
					</div>
				</Form>
				<Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={steps} />
			</Modal>
		);
	}
);

export default InterfaceModal;
