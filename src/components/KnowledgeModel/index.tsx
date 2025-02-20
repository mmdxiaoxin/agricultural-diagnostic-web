import { Button, DatePicker, Form, Input, message, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { forwardRef, useImperativeHandle, useState } from "react";

const { Option } = Select;

export type KnowledgeModalProps = {
	onSubmit?: (values: KnowledgeModalForm) => void;
	onReset?: () => void;
};

export type KnowledgeModalRef = {
	open: (type: "add" | "edit" | "view", data?: KnowledgeModalForm) => void;
	close: () => void;
};

type KnowledgeModalForm = {
	disease_name: string;
	disease_code: string;
	scientific_name: string;
	synonyms: string;
	symptoms: string;
	cause: string;
	disease_type: string;
	affected_plant: string;
	affected_part: string;
	disease_cycle: string;
	spread_method: string;
	geographical_area: string;
	preventive_measures: string;
	chemical_control: string;
	video_url: string;
	image_url: string;
	historical_cases: string;
	first_reported: string;
	last_update: string;
	severity: string;
	tags: string;
	research_sources: string;
};

const KnowledgeModal: React.FC<KnowledgeModalProps> = forwardRef<
	KnowledgeModalRef,
	KnowledgeModalProps
>(({ onReset, onSubmit }, ref) => {
	const [form] = Form.useForm();

	const [visible, setVisible] = useState(false);
	const [type, setType] = useState<"add" | "edit" | "view">("add");

	useImperativeHandle(ref, () => ({
		open: (type, data) => {
			form.setFieldsValue(data);
			// 这里可以根据 type 控制表单的显示
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
		// 这里可以将表单数据发送到后端
		onSubmit?.(values);
		message.success("病害信息提交成功");
	};

	const getTitle = (type: "add" | "edit" | "view") => {
		switch (type) {
			case "add":
				return "新增病害知识";
			case "edit":
				return "编辑病害知识";
			case "view":
				return "查看病害知识";
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
			style={{ top: 0, bottom: 0 }}
		>
			<Form
				form={form}
				name="plant_disease_knowledge"
				onFinish={handleFinish}
				initialValues={{
					severity: "低" // 示例：默认值
				}}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				style={{ height: "100%", overflowY: "auto" }}
			>
				<Form.Item
					label="病害名称"
					name="disease_name"
					rules={[{ required: true, message: "请输入病害名称" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item label="病害唯一编码" name="disease_code">
					<Input />
				</Form.Item>

				<Form.Item label="学名" name="scientific_name">
					<Input />
				</Form.Item>

				<Form.Item label="同义词" name="synonyms">
					<TextArea />
				</Form.Item>

				<Form.Item label="症状描述" name="symptoms">
					<TextArea />
				</Form.Item>

				<Form.Item label="病因" name="cause">
					<Input />
				</Form.Item>

				<Form.Item label="病害类型" name="disease_type">
					<Input />
				</Form.Item>

				<Form.Item label="受影响植物" name="affected_plant">
					<TextArea />
				</Form.Item>

				<Form.Item label="受影响部位" name="affected_part">
					<TextArea />
				</Form.Item>

				<Form.Item label="病害生命周期" name="disease_cycle">
					<TextArea />
				</Form.Item>

				<Form.Item label="传播方式" name="spread_method">
					<TextArea />
				</Form.Item>

				<Form.Item label="地理分布" name="geographical_area">
					<TextArea />
				</Form.Item>

				<Form.Item label="防治措施" name="preventive_measures">
					<TextArea />
				</Form.Item>

				<Form.Item label="化学防治方法" name="chemical_control">
					<TextArea />
				</Form.Item>

				<Form.Item label="视频 URL" name="video_url">
					<Input />
				</Form.Item>

				<Form.Item label="图片 URL" name="image_url">
					<Input />
				</Form.Item>

				<Form.Item label="历史病例" name="historical_cases">
					<TextArea />
				</Form.Item>

				<Form.Item label="首次报告时间" name="first_reported">
					<DatePicker />
				</Form.Item>

				<Form.Item label="最后更新时间" name="last_update">
					<DatePicker />
				</Form.Item>

				<Form.Item label="严重程度" name="severity">
					<Select>
						<Option value="低">低</Option>
						<Option value="中">中</Option>
						<Option value="高">高</Option>
					</Select>
				</Form.Item>

				<Form.Item label="标签" name="tags">
					<TextArea />
				</Form.Item>

				<Form.Item label="研究来源" name="research_sources">
					<TextArea />
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

export default React.memo(KnowledgeModal);
