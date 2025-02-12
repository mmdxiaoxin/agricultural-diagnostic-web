import { resetUserPassword } from "@/api/modules/user";
import { LockOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface PasswordModalProps {
	onReset?: () => void;
}
export interface PasswordModalRef {
	open: () => void;
}

interface PasswordForm {
	currentPassword: string;
	newPassword: string;
}

const PasswordModal = forwardRef<PasswordModalRef, PasswordModalProps>(({ onReset }, ref) => {
	const [form] = Form.useForm();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [formData, setFormData] = useState<PasswordForm>({
		currentPassword: "",
		newPassword: ""
	});

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	const handleOpen = () => {
		setIsModalVisible(true);
	};

	const handleOk = () => {
		form
			.validateFields()
			.then(_ => {
				form.submit();
			})
			.catch(error => {
				message.error("请检查输入是否正确: " + error.errorFields[0].errors[0]);
			});
	};

	const handleClose = () => {
		setIsModalVisible(false);
	};

	const handleSave = async (values: PasswordForm) => {
		try {
			const res = await resetUserPassword(values);
			if (res.code !== 200) throw new Error(res.message);

			setFormData(values);
			handleClose();
			message.success("密码修改成功 🎉");
			onReset?.();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<Modal title="修改密码" open={isModalVisible} onOk={handleOk} onCancel={handleClose}>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				onFinish={handleSave}
				initialValues={formData}
			>
				<Form.Item
					label="当前密码"
					name="currentPassword"
					rules={[{ required: true, message: "请输入当前密码" }]}
					style={{ height: 40 }}
				>
					<Input.Password prefix={<LockOutlined />} />
				</Form.Item>

				<Form.Item
					label="新密码"
					name="newPassword"
					rules={[{ required: true, message: "请输入新密码" }]}
					style={{ height: 40 }}
				>
					<Input.Password prefix={<LockOutlined />} />
				</Form.Item>
			</Form>
		</Modal>
	);
});

export default PasswordModal;
