import { Crop } from "@/api/interface/knowledge";
import { createCrop, updateCrop } from "@/api/modules/Knowledge";
import { Button, Form, Input, message, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface CropModalProps {
	onSubmit?: (values: CropModalForm) => void;
	onReset?: () => void;
}

export interface CropModalRef {
	open: (type: "add" | "edit" | "view", data?: Crop) => void;
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
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState<"add" | "edit" | "view">("add");
	const [corpId, setCorpId] = useState<number>();

	useImperativeHandle(ref, () => ({
		open: (type, data) => {
			form.setFieldsValue(data);
			setType(type);
			setCorpId(data?.id);
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

	const handleFinish = async (values: CropModalForm) => {
		setLoading(true);
		try {
			if (type === "add") {
				await createCrop(values);
			} else if (type === "edit") {
				if (!corpId) return;
				await updateCrop(corpId, values);
			}
			message.success("提交成功");
			handleCancel();
			onSubmit?.(values);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
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
		<Modal
			open={visible}
			title={getTitle(type)}
			onCancel={handleCancel}
			footer={null}
			width={{
				xs: "90%",
				sm: "90%",
				md: "50%",
				lg: "50%",
				xl: "40%",
				xxl: "30%"
			}}
			style={{ height: "100%", overflowY: "auto" }}
		>
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

				<Form.Item label="生长阶段" name="growthStage">
					<Input />
				</Form.Item>

				<Form.Item wrapperCol={{ span: 24, offset: 6 }}>
					<Button type="primary" htmlType="submit" loading={loading}>
						提交
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
});

export default CropModal;
