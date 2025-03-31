import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile } from "@/api/modules/file";
import { DIAGNOSIS_STATUS_COLOR, DIAGNOSIS_STATUS_TEXT } from "@/constants/status";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Image, Modal, Space, Tag, Typography } from "antd";
import clsx from "clsx";
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
						color={DIAGNOSIS_STATUS_COLOR[record.status]}
						icon={record.status === "success" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
					>
						{DIAGNOSIS_STATUS_TEXT[record.status]}
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
								{dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
							</Text>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<Text type="secondary" className="block mb-2">
								诊断结果
							</Text>
							{record.diagnosisResult ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{record.diagnosisResult?.predictions?.map((prediction, index) => (
										<div
											key={index}
											className="bg-white p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
										>
											<div className="flex items-center justify-between gap-1">
												<Text strong className="text-sm">
													{prediction.type === "classify" ? "分类" : "检测"}
												</Text>
												<Tag color="blue" className="text-xs">
													{(prediction.confidence * 100).toFixed(2)}%
												</Tag>
											</div>
											<Text className="block mt-0.5 text-gray-700 text-sm truncate">
												{prediction.class_name}
											</Text>
										</div>
									))}
								</div>
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
						<div
							className={clsx(
								"rounded-lg bg-gray-50",
								"w-full",
								"relative aspect-[4/3] overflow-y-auto"
							)}
						>
							<Image
								src={imageUrl}
								alt="诊断图片"
								className="object-contain w-full h-full"
								fallback="/images/image-placeholder.png"
							/>
							{record.diagnosisResult?.predictions &&
								record.diagnosisResult?.predictions?.length > 0 &&
								record.diagnosisResult?.predictions?.some(
									prediction => prediction.type === "detect"
								) && (
									<DetectImage
										src={imageUrl}
										alt="诊断结果"
										predictions={record.diagnosisResult?.predictions || []}
									/>
								)}
						</div>
					</Card>
				)}
			</div>
		</Modal>
	);
});

DiagnosisDetailModal.displayName = "DiagnosisDetailModal";

export default DiagnosisDetailModal;
