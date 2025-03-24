import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile } from "@/api/modules/file";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Image, Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";
import DetectImage from "../DetectImage";

const { Text, Title } = Typography;

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
			title={
				<div className="flex items-center gap-2">
					<Title level={4} className="!mb-0">
						诊断详情
					</Title>
					<Tag
						color={record.status === "completed" ? "success" : "processing"}
						icon={record.status === "completed" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
					>
						{record.status === "completed" ? "已完成" : "处理中"}
					</Tag>
				</div>
			}
			open={open}
			onCancel={() => {
				setOpen(false);
				setRecord(null);
				setImageUrl("");
			}}
			footer={null}
			width={900}
			className="diagnosis-detail-modal"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* 左侧信息 */}
				<Card className="h-full">
					<Space direction="vertical" size="large" className="w-full">
						<div className="bg-gray-50 p-4 rounded-lg">
							<Text type="secondary" className="block mb-2">
								诊断时间
							</Text>
							<Text className="text-lg">
								{dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}
							</Text>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<Text type="secondary" className="block mb-2">
								诊断结果
							</Text>
							{record.diagnosisResult ? (
								<Space direction="vertical" size={2}>
									{record.diagnosisResult.predictions.map((prediction, index) => (
										<div
											key={index}
											className="bg-white p-3 rounded-md border border-gray-100 shadow-sm"
										>
											<div className="flex items-center justify-between gap-2">
												<Text strong>{prediction.type === "classify" ? "分类" : "检测"}</Text>
												<Tag color="blue">{(prediction.confidence * 100).toFixed(2)}%</Tag>
											</div>
											<Text className="block mt-1 text-gray-700">{prediction.class_name}</Text>
										</div>
									))}
									{record.diagnosisResult?.predictions?.[0].type === "detect" && (
										<DetectImage
											imageUrl={imageUrl}
											predictions={record.diagnosisResult?.predictions || []}
										/>
									)}
								</Space>
							) : (
								<Text type="secondary">无结果</Text>
							)}
						</div>
					</Space>
				</Card>

				{/* 右侧图片 */}
				{record.fileId && (
					<Card className="h-full">
						<Text type="secondary" className="block mb-4">
							诊断图片
						</Text>
						<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
							<Image
								src={imageUrl}
								alt="诊断图片"
								className="object-contain w-full h-full"
								preview={true}
								fallback="/images/image-placeholder.png"
							/>
						</div>
					</Card>
				)}
			</div>
		</Modal>
	);
});

DiagnosisDetailModal.displayName = "DiagnosisDetailModal";

export default DiagnosisDetailModal;
