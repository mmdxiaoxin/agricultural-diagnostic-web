import { RemoteInterface } from "@/api/interface";
import { Button, Form, Input, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export type InterfaceModalProps = {
	onSave?: (values: any) => void;
	onCancel?: () => void;
};

export type InterfaceModalRef = {
	open: (mode: "create" | "edit", values?: RemoteInterface) => void;
	close: () => void;
};

const InterfaceModal = forwardRef<InterfaceModalRef, InterfaceModalProps>(
	({ onCancel, onSave }, ref) => {
		const [form] = Form.useForm();
		const [isModalVisible, setIsModalVisible] = useState(false);
		const [modalMode, setModalMode] = useState<"create" | "edit">("create");

		useImperativeHandle(
			ref,
			() => ({
				open: handleOpen,
				close: handleClose
			}),
			[]
		);

		const handleOpen = (mode: "create" | "edit", values?: RemoteInterface) => {
			setModalMode(mode);
			setIsModalVisible(true);
			if (values) {
				form.setFieldsValue(values);
			}
		};

		const handleClose = () => {
			setIsModalVisible(false);
			form.resetFields();
			onCancel?.();
		};

		const handleSave = async (values: any) => {
			onSave?.(values);
			handleClose();
		};

		return (
			<Modal
				title={modalMode === "edit" ? "编辑接口" : "添加接口"}
				open={isModalVisible}
				onCancel={handleClose}
				footer={null}
				width={600}
			>
				<Form form={form} onFinish={handleSave} layout="vertical">
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
		);
	}
);

export default InterfaceModal;
