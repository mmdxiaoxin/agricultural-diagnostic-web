import { DiagnosisFeedback } from "@/api/interface/diagnosis";
import { FEEDBACK_STATUS_COLOR, FEEDBACK_STATUS_TEXT } from "@/constants/status";
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";
import React, { forwardRef, useImperativeHandle, useState } from "react";

export interface FeedbackDetailModalRef {
	open: (feedback: DiagnosisFeedback) => void;
	close: () => void;
}

const FeedbackDetailModal = forwardRef<FeedbackDetailModalRef>((_, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [feedback, setFeedback] = useState<DiagnosisFeedback | null>(null);

	useImperativeHandle(ref, () => ({
		open: (feedbackData: DiagnosisFeedback) => {
			setFeedback(feedbackData);
			setIsVisible(true);
		},
		close: () => {
			setIsVisible(false);
		}
	}));

	const handleClose = () => {
		setIsVisible(false);
		setFeedback(null);
	};

	if (!feedback) return null;

	return (
		<Modal
			title="反馈详情"
			open={isVisible}
			onCancel={handleClose}
			footer={null}
			width={800}
			className="rounded-2xl"
		>
			<Descriptions bordered column={1} className="mt-4">
				<Descriptions.Item label="创建时间">
					{dayjs(feedback.createdAt).format("YYYY-MM-DD HH:mm:ss")}
				</Descriptions.Item>
				<Descriptions.Item label="更新时间">
					{dayjs(feedback.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
				</Descriptions.Item>
				<Descriptions.Item label="状态">
					<Tag color={FEEDBACK_STATUS_COLOR[feedback.status]} className="px-3 py-1 rounded-full">
						{FEEDBACK_STATUS_TEXT[feedback.status]}
					</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="反馈内容">{feedback.feedbackContent}</Descriptions.Item>
				<Descriptions.Item label="专家评论">
					{feedback.expertComment || "暂无评论"}
				</Descriptions.Item>
				{feedback.additionalInfo && Object.keys(feedback.additionalInfo).length > 0 && (
					<Descriptions.Item label="附加信息">
						<pre className="whitespace-pre-wrap">
							{JSON.stringify(feedback.additionalInfo, null, 2)}
						</pre>
					</Descriptions.Item>
				)}
				{feedback.correctedResult && Object.keys(feedback.correctedResult).length > 0 && (
					<Descriptions.Item label="修正结果">
						<pre className="whitespace-pre-wrap">
							{JSON.stringify(feedback.correctedResult, null, 2)}
						</pre>
					</Descriptions.Item>
				)}
			</Descriptions>
		</Modal>
	);
});

FeedbackDetailModal.displayName = "FeedbackDetailModal";

export default FeedbackDetailModal;
