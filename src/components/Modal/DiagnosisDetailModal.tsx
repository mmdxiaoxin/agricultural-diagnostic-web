import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile } from "@/api/modules/file";
import { Image, Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

const { Text } = Typography;

export interface DiagnosisDetailModalRef {
	open: (record: DiagnosisHistory) => void;
	close: () => void;
}

const DiagnosisDetailModal = forwardRef<DiagnosisDetailModalRef>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [record, setRecord] = useState<DiagnosisHistory | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");

	useImperativeHandle(ref, () => ({
		open: (record: DiagnosisHistory) => {
			setRecord(record);
			setOpen(true);
			// 如果有 fileId，加载图片
			if (record.fileId) {
				loadImage(record.fileId);
			}
		},
		close: () => {
			setOpen(false);
			setRecord(null);
			setImageUrl("");
		}
	}));

	// 加载图片
	const loadImage = async (fileId: string | number) => {
		try {
			const blob = await downloadFile(fileId);
			const url = URL.createObjectURL(blob);
			setImageUrl(url);
			return () => {
				URL.revokeObjectURL(url);
			};
		} catch (error) {
			console.error("图片加载失败", error);
		}
	};

	if (!record) return null;

	return (
		<Modal
			title="诊断详情"
			open={open}
			onCancel={() => {
				setOpen(false);
				setRecord(null);
				setImageUrl("");
			}}
			footer={null}
			width={800}
		>
			<Space direction="vertical" size="large" className="w-full">
				<div>
					<Text strong>诊断时间：</Text>
					<Text>{dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Text>
				</div>
				<div>
					<Text strong>状态：</Text>
					<Tag color={record.status === "completed" ? "success" : "processing"}>
						{record.status}
					</Tag>
				</div>
				<div>
					<Text strong>诊断结果：</Text>
					{record.diagnosisResult ? (
						<Space direction="vertical" size={0}>
							{record.diagnosisResult.predictions.map((prediction, index) => (
								<Text key={index}>
									{prediction.type === "classify" ? "分类" : "检测"}: {prediction.class_name} (
									{(prediction.confidence * 100).toFixed(2)}%)
								</Text>
							))}
						</Space>
					) : (
						<Text type="secondary">无结果</Text>
					)}
				</div>
				{record.fileId && (
					<div>
						<Text strong>诊断图片：</Text>
						<div className="mt-2">
							<Image
								src={imageUrl}
								alt="诊断图片"
								className="max-w-full h-auto rounded-lg"
								preview={false}
							/>
						</div>
					</div>
				)}
			</Space>
		</Modal>
	);
});

DiagnosisDetailModal.displayName = "DiagnosisDetailModal";

export default DiagnosisDetailModal;
