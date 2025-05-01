import { DiagnosisFeedback } from "@/api/interface/diagnosis";
import { updateDiagnosisFeedback } from "@/api/modules/diagnosis";
import { FEEDBACK_STATUS_TEXT } from "@/constants/status";
import { Form, Input, Modal, Select, message } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface FeedbackHandleModalRef {
	open: (record: DiagnosisFeedback) => void;
	close: () => void;
}

interface FeedbackHandleModalProps {
	onSuccess?: () => void;
}

const FeedbackHandleModal = forwardRef<FeedbackHandleModalRef, FeedbackHandleModalProps>(
	({ onSuccess }, ref) => {
		const [visible, setVisible] = useState(false);
		const [form] = Form.useForm();
		const [loading, setLoading] = useState(false);
		const [currentRecord, setCurrentRecord] = useState<DiagnosisFeedback | null>(null);

		useImperativeHandle(ref, () => ({
			open: (record: DiagnosisFeedback) => {
				setCurrentRecord(record);
				form.setFieldsValue({
					status: record.status,
					expertComment: record.expertComment,
					correctedResult: record.correctedResult
				});
				setVisible(true);
			},
			close: () => {
				setVisible(false);
				form.resetFields();
			}
		}));

		const handleOk = async () => {
			try {
				const values = await form.validateFields();
				setLoading(true);
				if (currentRecord) {
					await updateDiagnosisFeedback(currentRecord.id, values);
					message.success("反馈处理成功");
					onSuccess?.();
					setVisible(false);
					form.resetFields();
				}
			} catch (error) {
				console.error("反馈处理失败", error);
				message.error("反馈处理失败");
			} finally {
				setLoading(false);
			}
		};

		const handleCancel = () => {
			setVisible(false);
			form.resetFields();
		};

		return (
			<Modal
				title="反馈处理"
				open={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				confirmLoading={loading}
				width={600}
				destroyOnClose
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						status: "pending",
						expertComment: "",
						correctedResult: {}
					}}
				>
					<Form.Item
						label="反馈状态"
						name="status"
						rules={[{ required: true, message: "请选择反馈状态" }]}
					>
						<Select>
							{Object.entries(FEEDBACK_STATUS_TEXT).map(([key, value]) => (
								<Select.Option key={key} value={key}>
									{value}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="专家评论"
						name="expertComment"
						rules={[{ required: true, message: "请输入专家评论" }]}
					>
						<Input.TextArea rows={4} placeholder="请输入专家评论" />
					</Form.Item>

					<Form.Item label="修正结果" name="correctedResult">
						<Input.TextArea rows={4} placeholder="请输入修正结果（JSON格式）" />
					</Form.Item>
				</Form>
			</Modal>
		);
	}
);

FeedbackHandleModal.displayName = "FeedbackHandleModal";

export default FeedbackHandleModal;
