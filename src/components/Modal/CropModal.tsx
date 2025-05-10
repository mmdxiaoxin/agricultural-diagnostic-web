import { Crop } from "@/api/interface/knowledge";
import { createCrop, updateCrop } from "@/api/modules/Knowledge";
import { Button, Card, Form, Input, message, Modal, Space, Tabs } from "antd";
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
	scientificName?: string;
	growthStage?: string;
	cropType?: string;
	imageUrl?: string;
	alias?: string;
	description?: string;
	origin?: string;
	growthHabits?: string;
	growthCycle?: string;
	suitableArea?: string;
	suitableSeason?: string;
	suitableSoil?: string;
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

	const items = [
		{
			key: "basic",
			label: "基本信息",
			children: (
				<Card className="mb-4">
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

					<Form.Item label="作物类型" name="cropType">
						<Input />
					</Form.Item>

					<Form.Item label="作物别名" name="alias">
						<Input />
					</Form.Item>

					<Form.Item label="作物图片" name="imageUrl">
						<Input />
					</Form.Item>
				</Card>
			)
		},
		{
			key: "growth",
			label: "生长信息",
			children: (
				<Card className="mb-4">
					<Form.Item label="生长阶段" name="growthStage">
						<Input />
					</Form.Item>

					<Form.Item label="生长周期" name="growthCycle">
						<Input />
					</Form.Item>

					<Form.Item label="生长习性" name="growthHabits">
						<Input.TextArea rows={4} />
					</Form.Item>

					<Form.Item label="作物描述" name="description">
						<Input.TextArea rows={4} />
					</Form.Item>
				</Card>
			)
		},
		{
			key: "environment",
			label: "种植环境",
			children: (
				<Card className="mb-4">
					<Form.Item label="产地" name="origin">
						<Input />
					</Form.Item>

					<Form.Item label="适宜种植区域" name="suitableArea">
						<Input />
					</Form.Item>

					<Form.Item label="适宜种植季节" name="suitableSeason">
						<Input />
					</Form.Item>

					<Form.Item label="适宜种植土壤" name="suitableSoil">
						<Input />
					</Form.Item>
				</Card>
			)
		}
	];

	return (
		<Modal
			open={visible}
			title={getTitle(type)}
			onCancel={handleCancel}
			footer={null}
			width={{
				xs: "95%",
				sm: "90%",
				md: "80%",
				lg: "70%",
				xl: 800,
				xxl: 800
			}}
		>
			<Form
				form={form}
				name="crop_information"
				onFinish={handleFinish}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="vertical"
			>
				<Tabs
					items={items}
					defaultActiveKey="basic"
					className="crop-form-tabs"
					tabPosition="left"
					style={{ minHeight: "500px" }}
				/>

				<div className="flex justify-end mt-4">
					<Space>
						<Button onClick={handleCancel}>取消</Button>
						<Button type="primary" htmlType="submit" loading={loading}>
							提交
						</Button>
					</Space>
				</div>
			</Form>
		</Modal>
	);
});

export default CropModal;
