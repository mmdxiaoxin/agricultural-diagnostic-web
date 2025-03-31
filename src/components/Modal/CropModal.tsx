import { Button, Form, Input, message, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface CropModalProps {
	onSubmit?: (values: CropModalForm) => void;
	onReset?: () => void;
}

export interface CropModalRef {
	open: (type: "add" | "edit" | "view", data?: CropModalForm) => void;
	close: () => void;
}

type CropModalForm = {
	name: string;
	scientificName: string;
	growthStage: string;
};

const CropModal = forwardRef<CropModalRef, CropModalProps>(({ onReset, onSubmit }, ref) => {
	const [form] = Form.useForm();
	const [visible, setVisible] = useState(false);
	const [type, setType] = useState<"add" | "edit" | "view">("add");

	useImperativeHandle(ref, () => ({
		open: (type, data) => {
			form.setFieldsValue(data);
			setType(type);
			setVisible(true);
		},
		close: () => {
			form.resetFields();
			setVisible(false);
		}
	}));

	const handleCancel = () => {
		form.resetFields();
		setVisible(false);
		onReset?.();
	};

	const handleFinish = (values: any) => {
		console.log("Form Values:", values);
		onSubmit?.(values);
		message.success("作物信息提交成功");
	};

	const getTitle = (type: "add" | "edit" | "view") => {
		switch (type) {
			case "add":
				return "新增作物信息";
			case "edit":
				return "编辑作物信息";
			case "view":
				return "查看作物信息";
			default:
				return "";
		}
	};

	return (
		<Modal open={visible} title={getTitle(type)} onCancel={handleCancel} footer={null}>
			<Form
				form={form}
				name="crop_information"
				onFinish={handleFinish}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				style={{ height: "100%", overflowY: "auto" }}
			>
				<Form.Item
					label="作物名称"
					name="name"
					rules={[{ required: true, message: "请输入作物名称" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item label="学名" name="scientificName">
					<Input />
				</Form.Item>

				<Form.Item label="生长周期" name="growthStage">
					<Input />
				</Form.Item>

				<Form.Item wrapperCol={{ span: 24, offset: 6 }}>
					<Button type="primary" htmlType="submit">
						提交
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
});

export default CropModal;
