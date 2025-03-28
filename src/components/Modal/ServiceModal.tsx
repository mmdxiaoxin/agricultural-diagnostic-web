import { createRemote, updateRemote } from "@/api/modules";
import { Button, Form, Input, message, Modal, Select, Table, Space } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { RemoteInterface } from "@/api/interface/service";

export type ServiceModalProps = {
	onSave?: (values: any) => void;
	onCancel?: () => void;
};

export type ServiceModalRef = {
	open: (mode: "create" | "edit", values?: any) => void;
	close: () => void;
};

const ServiceModal = forwardRef<ServiceModalRef, ServiceModalProps>(({ onCancel, onSave }, ref) => {
	const [form] = Form.useForm();
	const [interfaceForm] = Form.useForm();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [saveLoading, setSaveLoading] = useState(false);
	const [isInterfaceModalVisible, setIsInterfaceModalVisible] = useState(false);
	const [interfaces, setInterfaces] = useState<RemoteInterface[]>([]);

	useImperativeHandle(
		ref,
		() => ({
			open: handleOpen,
			close: handleClose
		}),
		[]
	);

	const handleSave = (values: {
		serviceId: number;
		serviceName: string;
		serviceType: string;
		description: string;
		status: "active" | "inactive" | "under_maintenance";
		interfaces: RemoteInterface[];
	}) => {
		const { serviceId, ...rest } = values;
		setSaveLoading(true);
		const submitValues = modalMode === "edit" ? updateRemote(serviceId, rest) : createRemote(rest);
		submitValues
			.then(() => {
				handleClose();
				message.success("保存成功");
				onSave?.(rest);
			})
			.catch(() => {
				message.error("保存失败");
			})
			.finally(() => {
				setSaveLoading(false);
			});
	};

	const handleOpen = (mode: "create" | "edit", values?: any) => {
		setModalMode(mode);
		setIsModalVisible(true);
		if (values) {
			form.setFieldsValue(values);
			setInterfaces(values.interfaces || []);
		}
	};

	const handleClose = () => {
		setIsModalVisible(false);
		setIsInterfaceModalVisible(false);
		form.resetFields();
		interfaceForm.resetFields();
		setInterfaces([]);
		onCancel?.();
	};

	const handleAddInterface = () => {
		setIsInterfaceModalVisible(true);
	};

	const handleInterfaceSave = (values: any) => {
		setInterfaces([...interfaces, { ...values, id: Date.now() }]);
		setIsInterfaceModalVisible(false);
		interfaceForm.resetFields();
	};

	const interfaceColumns = [
		{
			title: "接口名称",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "接口类型",
			dataIndex: "type",
			key: "type"
		},
		{
			title: "接口地址",
			dataIndex: "url",
			key: "url"
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record: RemoteInterface) => (
				<Space>
					<Button type="link" onClick={() => handleEditInterface(record)}>
						编辑
					</Button>
					<Button type="link" danger onClick={() => handleDeleteInterface(record.id)}>
						删除
					</Button>
				</Space>
			)
		}
	];

	const handleEditInterface = (record: RemoteInterface) => {
		interfaceForm.setFieldsValue(record);
		setIsInterfaceModalVisible(true);
	};

	const handleDeleteInterface = (id: number) => {
		setInterfaces(interfaces.filter(item => item.id !== id));
	};

	return (
		<>
			<Modal
				title={modalMode === "edit" ? "编辑服务" : "创建服务"}
				open={isModalVisible}
				onCancel={handleClose}
				footer={null}
				width={800}
			>
				<Form form={form} onFinish={handleSave} layout="vertical">
					<Form.Item name="serviceId" hidden />
					<Form.Item
						label="服务名称"
						name="serviceName"
						rules={[{ required: true, message: "请输入服务名称" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="服务类型" name="serviceType">
						<Input />
					</Form.Item>

					<Form.Item label="服务描述" name="description">
						<Input.TextArea />
					</Form.Item>

					<Form.Item
						label="服务状态"
						name="status"
						rules={[{ required: true, message: "请选择服务状态!" }]}
					>
						<Select>
							<Select.Option value="active">开启</Select.Option>
							<Select.Option value="inactive">关闭</Select.Option>
							<Select.Option value="under_maintenance">维护中</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item label="接口列表">
						<Button type="primary" onClick={handleAddInterface} style={{ marginBottom: 16 }}>
							添加接口
						</Button>
						<Table
							columns={interfaceColumns}
							dataSource={interfaces}
							rowKey="id"
							pagination={false}
						/>
						<Form.Item name="interfaces" hidden>
							<Input />
						</Form.Item>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" loading={saveLoading}>
							保存
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="编辑接口"
				open={isInterfaceModalVisible}
				onCancel={() => setIsInterfaceModalVisible(false)}
				footer={null}
				width={600}
			>
				<Form form={interfaceForm} onFinish={handleInterfaceSave} layout="vertical">
					<Form.Item
						label="接口名称"
						name="name"
						rules={[{ required: true, message: "请输入接口名称" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="接口类型" name="type">
						<Input />
					</Form.Item>

					<Form.Item label="接口地址" name="url">
						<Input />
					</Form.Item>

					<Form.Item label="接口描述" name="description">
						<Input.TextArea />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit">
							保存
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
});

export default ServiceModal;
