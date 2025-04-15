import { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input, InputNumber, Switch, Select, Space, Modal, Button, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import clsx from "clsx";
import type { ModelConfig } from "@/typings/model";

export interface ModelManageModalRef {
	open: (model?: ModelConfig) => void;
	close: () => void;
}

interface ModelManageModalProps {
	onOk?: (values: any) => void;
}

const ModelManageModal = forwardRef<ModelManageModalRef, ModelManageModalProps>(({ onOk }, ref) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
	const [form] = Form.useForm();

	useImperativeHandle(ref, () => ({
		open: (model?: ModelConfig) => {
			if (model) {
				setEditingModel(model);
				form.setFieldsValue(model);
			} else {
				form.resetFields();
				setEditingModel(null);
			}
			setIsModalVisible(true);
		},
		close: () => {
			setIsModalVisible(false);
			form.resetFields();
			setEditingModel(null);
		}
	}));

	const handleSubmit = (values: any) => {
		onOk?.(values);
		setIsModalVisible(false);
		form.resetFields();
		setEditingModel(null);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
		setEditingModel(null);
	};

	return (
		<Modal
			title={editingModel ? "编辑模型" : "添加模型"}
			open={isModalVisible}
			onCancel={handleCancel}
			footer={null}
			width={{
				xs: "90%",
				sm: "90%",
				md: "80%",
				lg: "80%",
				xl: "70%",
				xxl: "70%"
			}}
			className="rounded-2xl"
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				initialValues={{
					type: "yolo",
					status: "active",
					parameters: {
						confidence: 0.5,
						iou: 0.5,
						batchSize: 1
					}
				}}
			>
				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						name="name"
						label="模型名称"
						rules={[{ required: true, message: "请输入模型名称" }]}
					>
						<Input placeholder="请输入模型名称" className="rounded-lg" />
					</Form.Item>

					<Form.Item
						name="type"
						label="模型类型"
						rules={[{ required: true, message: "请选择模型类型" }]}
					>
						<Select className="rounded-lg">
							<Select.Option value="yolo">YOLO</Select.Option>
							<Select.Option value="resnet">ResNet</Select.Option>
							<Select.Option value="other">其他</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item
						name="version"
						label="版本"
						rules={[{ required: true, message: "请输入版本号" }]}
					>
						<Input placeholder="请输入版本号" className="rounded-lg" />
					</Form.Item>

					<Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
						<Switch
							checkedChildren="已激活"
							unCheckedChildren="未激活"
							defaultChecked
							className="bg-gray-200"
						/>
					</Form.Item>
				</div>

				<Form.Item name="description" label="描述">
					<Input.TextArea rows={4} placeholder="请输入模型描述" className="rounded-lg" />
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						name="weightPath"
						label="权重文件路径"
						rules={[{ required: true, message: "请选择权重文件" }]}
					>
						<Input
							placeholder="请选择权重文件"
							addonAfter={
								<Button icon={<UploadOutlined />} className="rounded-lg">
									上传
								</Button>
							}
							className="rounded-lg"
						/>
					</Form.Item>

					<Form.Item
						name="configPath"
						label="配置文件路径"
						rules={[{ required: true, message: "请选择配置文件" }]}
					>
						<Input
							placeholder="请选择配置文件"
							addonAfter={
								<Button icon={<UploadOutlined />} className="rounded-lg">
									上传
								</Button>
							}
							className="rounded-lg"
						/>
					</Form.Item>
				</div>

				<Card title="模型参数配置" className="mb-4 rounded-lg">
					<div className="grid grid-cols-3 gap-4">
						<Form.Item
							name={["parameters", "confidence"]}
							label="置信度阈值"
							rules={[{ required: true, message: "请输入置信度阈值" }]}
						>
							<InputNumber min={0} max={1} step={0.1} className="w-full rounded-lg" />
						</Form.Item>

						<Form.Item
							name={["parameters", "iou"]}
							label="IOU阈值"
							rules={[{ required: true, message: "请输入IOU阈值" }]}
						>
							<InputNumber min={0} max={1} step={0.1} className="w-full rounded-lg" />
						</Form.Item>

						<Form.Item
							name={["parameters", "batchSize"]}
							label="批处理大小"
							rules={[{ required: true, message: "请输入批处理大小" }]}
						>
							<InputNumber min={1} className="w-full rounded-lg" />
						</Form.Item>
					</div>
				</Card>

				<Form.Item>
					<Space>
						<Button
							type="primary"
							htmlType="submit"
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							{editingModel ? "更新" : "添加"}
						</Button>
						<Button
							onClick={handleCancel}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							取消
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</Modal>
	);
});

ModelManageModal.displayName = "ModelManageModal";

export default ModelManageModal;
