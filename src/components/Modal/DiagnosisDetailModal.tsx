import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile } from "@/api/modules/file";
import { DIAGNOSIS_STATUS_COLOR, DIAGNOSIS_STATUS_TEXT } from "@/constants/status";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Image, Modal, Space, Tag, Typography } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import DiagnosisResultCard from "../Card/DiagnosisResultCard";
import DetectImage from "../DetectImage";
import DiagnosisLogsList from "../List/DiagnosisLogsList";

const { Text, Title } = Typography;

export interface DiagnosisDetailModalRef {
	open: (record: DiagnosisHistory) => void;
	close: () => void;
}

const ITEM_HEIGHT = 100; // 每个卡片的高度
const ITEM_WIDTH = 300; // 每个卡片的宽度

const DiagnosisDetailModal = forwardRef<DiagnosisDetailModalRef>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [record, setRecord] = useState<DiagnosisHistory | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [drawerVisible, setDrawerVisible] = useState(false);

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

	const predictions = useMemo(() => {
		if (!record?.diagnosisResult?.predictions) return [];
		return record.diagnosisResult.predictions;
	}, [record]);

	const shouldShowDetectImage = useMemo(() => {
		if (!predictions.length) return false;
		return predictions.some(prediction => prediction.type === "detect");
	}, [predictions]);

	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		const prediction = predictions[index];
		return (
			<div style={style} className="px-2">
				<DiagnosisResultCard prediction={prediction} />
			</div>
		);
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
								<div className="h-[180px]">
									<List
										height={180}
										itemCount={predictions.length}
										itemSize={ITEM_HEIGHT}
										width={ITEM_WIDTH}
									>
										{Row}
									</List>
								</div>
							) : (
								<Text type="secondary">无结果</Text>
							)}
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<Text type="secondary" className="block mb-2">
								操作记录
							</Text>
							<Button type="primary" onClick={() => setDrawerVisible(true)} className="w-full">
								查看诊断日志
							</Button>
						</div>
					</Space>
				</Card>

				{/* 右侧图片 */}
				<Card>
					<Text type="secondary" className="block mb-4">
						诊断图片
					</Text>
					<div className={clsx("rounded-lg bg-gray-50", "w-full", "relative overflow-y-auto")}>
						<Image
							src={imageUrl}
							alt="诊断图片"
							className="object-contain w-full h-full aspect-[4/3]"
							fallback="/images/image-placeholder.png"
						/>
						{shouldShowDetectImage && (
							<DetectImage
								src={imageUrl}
								className="object-contain w-full h-full aspect-[4/3]"
								alt="诊断结果"
								predictions={predictions}
							/>
						)}
					</div>
				</Card>
			</div>
			<Drawer
				title="诊断日志"
				placement="right"
				onClose={() => setDrawerVisible(false)}
				open={drawerVisible}
				width={600}
			>
				<DiagnosisLogsList diagnosisId={record.id} />
			</Drawer>
		</Modal>
	);
});

DiagnosisDetailModal.displayName = "DiagnosisDetailModal";

export default DiagnosisDetailModal;
