import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Select } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

const { TextArea } = Input;

export type DiagnosisRuleModalRef = {
	open: () => void;
	close: () => void;
};

export type DiagnosisRuleModalProps = {};

const DiagnosisRuleModal = forwardRef<DiagnosisRuleModalRef, DiagnosisRuleModalProps>((_, ref) => {
	const [visible, setVisible] = useState(false);
	const [form] = Form.useForm();

	const handleFinish = (values: any) => {
		console.log(values);
	};

	useImperativeHandle(ref, () => ({
		open: () => {
			setVisible(true);
		},
		close: () => {
			setVisible(false);
		}
	}));

	return (
		<Modal open={visible} onCancel={() => setVisible(false)} footer={null} width={800}>
			<Form form={form} layout="vertical" className="space-y-4" onFinish={handleFinish}>
				<Form.List name="diagnosisRules">
					{(fields, { add, remove }) => (
						<div className="space-y-4">
							{fields.map(({ key, name, ...restField }) => (
								<Card key={key} className="bg-gray-50">
									<div className="flex justify-between items-start mb-4">
										<h4 className="text-base font-medium">诊断规则 {name + 1}</h4>
										<MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
									</div>
									<div className="space-y-4">
										<Form.Item
											{...restField}
											name={[name, "symptomIds"]}
											label="相关症状"
											rules={[{ required: true, message: "请选择相关症状" }]}
										>
											<Select mode="multiple" placeholder="请选择相关症状">
												{/* 这里需要从symptoms中获取选项 */}
											</Select>
										</Form.Item>

										<Form.Item
											{...restField}
											name={[name, "probability"]}
											label="诊断概率"
											rules={[{ required: true, message: "请输入诊断概率" }]}
										>
											<Input type="number" min={0} max={100} placeholder="请输入诊断概率(0-100)" />
										</Form.Item>

										<Form.Item
											{...restField}
											name={[name, "recommendedAction"]}
											label="建议措施"
											rules={[{ required: true, message: "请输入建议措施" }]}
										>
											<TextArea rows={3} placeholder="请输入建议措施" />
										</Form.Item>
									</div>
								</Card>
							))}
							<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
								添加诊断规则
							</Button>
						</div>
					)}
				</Form.List>
			</Form>
		</Modal>
	);
});

export default DiagnosisRuleModal;
