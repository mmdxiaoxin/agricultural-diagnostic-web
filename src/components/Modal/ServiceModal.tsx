import { Button, Form, Input, Modal, Select } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

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

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");

	useImperativeHandle(
		ref,
		() => ({
			open: handleOpen,
			close: handleCancel
		}),
		[]
	);

	const handleSave = (values: any) => {
		onSave?.(values);
	};

	const handleOpen = (mode: "create" | "edit", values?: any) => {
		setModalMode(mode);
		setIsModalVisible(true);
		form.setFieldsValue(values);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
		onCancel?.();
	};

	return (
		<Modal
			title={modalMode === "edit" ? "编辑服务" : "创建服务"}
			open={isModalVisible}
			onCancel={handleCancel}
			footer={null}
			width={600}
		>
			<Form form={form} onFinish={handleSave} layout="vertical">
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

				<Form.Item label="服务URL" name="endpointUrl">
					<Input />
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit">
						保存
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
});

export default ServiceModal;
