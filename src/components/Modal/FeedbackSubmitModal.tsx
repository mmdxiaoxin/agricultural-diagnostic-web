import { createDiagnosisFeedback } from "@/api/modules/diagnosis";
import { Form, Input, message, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export type DiagnosisFeedbackModalProps = {};
export type DiagnosisFeedbackModalRef = {
	open: (diagnosisId: number) => void;
	close: () => void;
};

const FeedbackSubmitModal = forwardRef<DiagnosisFeedbackModalRef, DiagnosisFeedbackModalProps>(
	(_, ref) => {
		const [form] = Form.useForm();
		const [loading, setLoading] = useState(false);
		const [diagnosisId, setDiagnosisId] = useState<number | null>(null);
		const [visible, setVisible] = useState(false);

		useImperativeHandle(ref, () => ({
			open: (id: number) => {
				setDiagnosisId(id);
				setVisible(true);
			},
			close: () => {
				setDiagnosisId(null);
				setVisible(false);
				form.resetFields();
			}
		}));

		const handleOk = () => {
			form.submit();
		};

		const handleCancel = () => {
			setDiagnosisId(null);
			setVisible(false);
			form.resetFields();
		};

		const handleFinish = async (values: { feedbackContent: string }) => {
			setLoading(true);
			try {
				if (!diagnosisId) {
					message.error("请先选择诊断记录");
					return;
				}
				await createDiagnosisFeedback(diagnosisId, {
					feedbackContent: values.feedbackContent
				});
				message.success("反馈成功");
				handleCancel();
			} catch (error) {
				message.error("反馈失败");
			} finally {
				setLoading(false);
			}
		};

		return (
			<Modal
				title="诊断反馈"
				open={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				confirmLoading={loading}
				width={{
					xs: "80%",
					sm: "60%",
					md: "40%",
					lg: "30%",
					xl: "30%"
				}}
			>
				<Form form={form} onFinish={handleFinish}>
					<Form.Item label="反馈内容" name="feedbackContent">
						<Input.TextArea
							rows={4}
							allowClear
							placeholder="请输入反馈内容"
							maxLength={256}
							showCount
						/>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
);

FeedbackSubmitModal.displayName = "FeedbackSubmitModal";

export default FeedbackSubmitModal;
