import { RoleItem } from "@/api/interface";
import { Form, Input, Modal } from "antd";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface RoleModalRef {
	open: (role?: RoleItem) => void;
	close: () => void;
}

interface RoleModalProps {
	onSave: (values: any) => void;
}

const RoleModal = forwardRef<RoleModalRef, RoleModalProps>(({ onSave }, ref) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

	useImperativeHandle(ref, () => ({
		open: (role?: RoleItem) => {
			if (role) {
				setEditingRole(role);
				form.setFieldsValue(role);
			} else {
				setEditingRole(null);
				form.resetFields();
			}
			setModalVisible(true);
		},
		close: () => {
			setModalVisible(false);
			setEditingRole(null);
			form.resetFields();
		}
	}));

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			onSave(values);
			setModalVisible(false);
		} catch (error: any) {
			// 表单验证失败
		}
	};

	const handleModalCancel = () => {
		setModalVisible(false);
		setEditingRole(null);
		form.resetFields();
	};

	return (
		<Modal
			title={editingRole ? "编辑角色" : "添加角色"}
			open={modalVisible}
			onOk={handleModalOk}
			onCancel={handleModalCancel}
			destroyOnClose
		>
			<Form form={form} layout="vertical">
				<Form.Item
					name="name"
					label="角色名称"
					rules={[{ required: true, message: "请输入角色名称" }]}
				>
					<Input placeholder="请输入角色名称" />
				</Form.Item>
				<Form.Item
					name="alias"
					label="角色别名"
					rules={[{ required: true, message: "请输入角色别名" }]}
				>
					<Input placeholder="请输入角色别名" />
				</Form.Item>
				<Form.Item
					name="description"
					label="角色描述"
					rules={[{ required: true, message: "请输入角色描述" }]}
				>
					<Input.TextArea placeholder="请输入角色描述" rows={4} />
				</Form.Item>
			</Form>
		</Modal>
	);
});

RoleModal.displayName = "RoleModal";

export default RoleModal;
