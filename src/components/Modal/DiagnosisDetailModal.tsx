import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile } from "@/api/modules";
import { DIAGNOSIS_STATUS_COLOR, DIAGNOSIS_STATUS_TEXT } from "@/constants/status";
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Image, Modal, Space, Tag, Typography } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import DiagnosisMatchResultCard from "../Card/DiagnosisMatchResultCard";
import DiagnosisResultCard from "../Card/DiagnosisResultCard";
import DetectImage from "../DetectImage";
import DiagnosisLogsList from "../List/DiagnosisLogsList";

const { Text, Title } = Typography;

export interface DiagnosisDetailModalRef {
	open: (record: DiagnosisHistory) => void;
	close: () => void;
}

const DiagnosisDetailModal = forwardRef<DiagnosisDetailModalRef>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [record, setRecord] = useState<DiagnosisHistory | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [matchResultDrawerVisible, setMatchResultDrawerVisible] = useState(false);

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

	const matchResults = useMemo(() => {
		if (!record?.diagnosisResult?.matchResults) return [];
		return record.diagnosisResult.matchResults;
	}, [record]);

	console.log(matchResults);

	if (!record) return null;

	return (
		<Modal
			title={
				<Space align="center" size="large">
					<Title level={4} className="!mb-0">
						诊断详情
					</Title>
					<Tag
						color={DIAGNOSIS_STATUS_COLOR[record.status]}
						icon={record.status === "success" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
					>
						{DIAGNOSIS_STATUS_TEXT[record.status]}
					</Tag>
				</Space>
			}
			open={open}
			onCancel={() => {
				setOpen(false);
				setRecord(null);
				setImageUrl("");
			}}
			footer={null}
			width={{
				xs: "90%",
				sm: "90%",
				md: "90%",
				lg: "80%",
				xl: "70%",
				xxl: "70%"
			}}
			className="top-8"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* 左侧信息 */}
				<Card className="h-full">
					<Space direction="vertical" className="w-full">
						<div className="bg-gray-50 p-4 rounded-lg">
							<Text type="secondary" className="block mb-2">
								诊断时间
							</Text>
							<Text className="text-lg">
								{dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
							</Text>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex justify-between items-center mb-2">
								<Text type="secondary">诊断结果</Text>
								{matchResults.length > 0 && (
									<Button
										type="primary"
										icon={<BookOutlined />}
										onClick={() => setMatchResultDrawerVisible(true)}
										size="small"
									>
										查看病害匹配
									</Button>
								)}
							</div>
							{record.diagnosisResult ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto">
									{predictions.map((prediction, index) => (
										<DiagnosisResultCard key={index} prediction={prediction} />
									))}
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
				<Card className="h-full">
					<Text type="secondary" className="block mb-4">
						诊断图片
					</Text>
					<div className={clsx("bg-gray-50", "w-full", "overflow-y-auto")}>
						{shouldShowDetectImage ? (
							<DetectImage
								src={imageUrl}
								className="object-contain w-full aspect-[4/3]"
								alt="诊断结果"
								predictions={predictions}
							/>
						) : (
							<Image src={imageUrl} alt="诊断图片" className="object-contain w-full aspect-[4/3]" />
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
			<Drawer
				title="病害匹配结果"
				placement="right"
				onClose={() => setMatchResultDrawerVisible(false)}
				open={matchResultDrawerVisible}
				width={800}
			>
				<div className="space-y-4">
					{matchResults.map((matchResult, index) => (
						<DiagnosisMatchResultCard key={index} matchResult={matchResult} />
					))}
				</div>
			</Drawer>
		</Modal>
	);
});

DiagnosisDetailModal.displayName = "DiagnosisDetailModal";

export default DiagnosisDetailModal;
