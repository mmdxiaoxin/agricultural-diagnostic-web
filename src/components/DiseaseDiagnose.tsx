import { RemoteService } from "@/api/interface";
import type { DiagnoseResult, DiagnosisSupport } from "@/api/interface/diagnosis";
import {
	getDiagnosisSupport,
	getRemotes,
	startDiagnosis,
	uploadDiagnosisImage
} from "@/api/modules";
import { CameraOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Image,
	message,
	Select,
	Space,
	Tabs,
	Upload,
	UploadFile,
	UploadProps
} from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import CameraUpload from "./CameraUpload";
import DiagnosisMatchResultCard from "./Card/DiagnosisMatchResultCard";
import DiagnosisResultCard from "./Card/DiagnosisResultCard";
import DetectImage from "./DetectImage";
import FeedbackSubmitModal, { DiagnosisFeedbackModalRef } from "./Modal/FeedbackSubmitModal";
import ServiceCascader from "./ServiceCascader";

export interface DiseaseDiagnoseProps {
	type?: "image" | "test";
	onPredict?: (image: File) => void;
	selectRef?: React.RefObject<HTMLDivElement>;
	uploadRef?: React.RefObject<HTMLDivElement>;
	buttonRef?: React.RefObject<HTMLButtonElement>;
}

const DiseaseDiagnose: React.FC<DiseaseDiagnoseProps> = ({
	onPredict,
	type = "image",
	selectRef,
	uploadRef,
	buttonRef
}) => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [detectionResults, setDetectionResults] = useState<DiagnoseResult>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [serviceId, setServiceId] = useState<number>();
	const [configId, setConfigId] = useState<number>();
	const [serviceList, setServiceList] = useState<RemoteService[]>([]);
	const [supportList, setSupportList] = useState<DiagnosisSupport[]>([]);
	const [diagnosisId, setDiagnosisId] = useState<number>();
	const feedbackSubmitModalRef = useRef<DiagnosisFeedbackModalRef>(null);

	const fetchServiceList = async () => {
		const res = await getRemotes();
		if (res.code !== 200 && res.code !== 201) throw new Error("获取服务列表失败，请重试！");
		if (!res.data) throw new Error("获取服务列表失败，请重试！");
		setServiceList(res.data);
	};

	const fetchSupportList = async () => {
		const res = await getDiagnosisSupport();
		if (res.code !== 200 && res.code !== 201) throw new Error("获取诊断支持列表失败，请重试！");
		if (!res.data) throw new Error("获取诊断支持列表失败，请重试！");
		setSupportList(res.data);
	};

	useEffect(() => {
		if (type === "test") {
			fetchServiceList();
		} else {
			fetchSupportList();
		}
	}, [type]);

	// 处理级联选择器的变化
	const handleServiceChange = (value: [number, number] | undefined) => {
		if (value) {
			setServiceId(value[0]);
			setConfigId(value[1]);
		} else {
			setServiceId(undefined);
			setConfigId(undefined);
		}
	};

	// 处理 Select 选择器的变化
	const handleSupportChange = (value: string) => {
		const support = supportList.find(item => item.key === value);
		if (support) {
			setServiceId(support.value.serviceId);
			setConfigId(support.value.configId);
		} else {
			setServiceId(undefined);
			setConfigId(undefined);
		}
	};

	// 上传并预测
	const handleUploadAndPredict = async () => {
		if (!selectedImage) {
			setError("请选择一张图片上传！");
			return;
		}

		if (!serviceId || !configId) {
			setError("请选择服务和配置！");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// * 上传图片
			const uploadRes = await uploadDiagnosisImage(selectedImage);
			if (uploadRes.code !== 200 && uploadRes.code !== 201) throw new Error("上传失败，请重试！");
			if (!uploadRes.data) throw new Error("上传失败，请重试！");
			const diagnosisId = uploadRes.data.id;
			setDiagnosisId(diagnosisId);

			// * 开始诊断
			const diagnoseRes = await startDiagnosis({ diagnosisId, serviceId, configId });
			if (diagnoseRes.code !== 200 && diagnoseRes.code !== 201)
				throw new Error("检测失败，请重试！");
			setDetectionResults(diagnoseRes.data);
			onPredict?.(selectedImage);
			message.success("上传成功，检测完成！");
		} catch (error) {
			setError("上传失败，请重试！");
		} finally {
			setLoading(false);
			setFileList([]);
		}
	};

	const handleChange: UploadProps["onChange"] = info => {
		const { fileList: newFileList } = info;
		setFileList(newFileList);

		// 如果文件上传成功，清空文件列表
		if (info.file.status === "done" || info.file.status === "error") {
			setFileList([]);
		}
	};

	const handleCameraCapture = (file: File) => {
		setSelectedImage(file);
		setDetectionResults(undefined); // 清空上一次的检测结果
		const reader = new FileReader();
		reader.onload = e => setPreviewUrl(e.target?.result as string);
		reader.readAsDataURL(file);
	};

	return (
		<Card title="图片诊断" className="max-w-3xl" variant="borderless">
			<Space direction="vertical" className="w-full" size="large">
				{type === "test" ? (
					<div ref={selectRef}>
						<ServiceCascader
							serviceList={serviceList}
							value={serviceId && configId ? [serviceId, configId] : undefined}
							onChange={handleServiceChange}
						/>
					</div>
				) : (
					<div ref={selectRef}>
						<Select
							placeholder="请选择诊断支持"
							className="w-full"
							onChange={handleSupportChange}
							value={
								supportList.find(
									item => item.value.serviceId === serviceId && item.value.configId === configId
								)?.key
							}
						>
							{supportList.map(item => (
								<Select.Option key={item.key} value={item.key}>
									{item.key}
								</Select.Option>
							))}
						</Select>
					</div>
				)}
				{/* 图片选择与预览 */}
				<Card size="small" className="bg-gray-50">
					<Tabs
						defaultActiveKey="upload"
						items={[
							{
								key: "upload",
								label: (
									<span>
										<UploadOutlined />
										文件上传
									</span>
								),
								children: (
									<div ref={uploadRef}>
										<Upload
											accept="image/*"
											beforeUpload={file => {
												setSelectedImage(file);
												setDetectionResults(undefined); // 清空上一次的检测结果
												const reader = new FileReader();
												reader.onload = e => setPreviewUrl(e.target?.result as string);
												reader.readAsDataURL(file);
												return false;
											}}
											showUploadList={false}
											fileList={fileList}
											onChange={handleChange}
											listType="picture"
											className="text-center"
										>
											<Button
												icon={<UploadOutlined />}
												className={clsx(
													"px-6 h-10",
													"rounded-lg",
													"shadow-sm hover:shadow-md",
													"transition-all duration-300",
													"flex items-center gap-2"
												)}
											>
												选择图片
											</Button>
										</Upload>
									</div>
								)
							},
							{
								key: "camera",
								label: (
									<span>
										<CameraOutlined />
										拍照上传
									</span>
								),
								children: <CameraUpload onCapture={handleCameraCapture} loading={loading} />
							}
						]}
					/>
					{previewUrl && (
						<div className="mt-4 text-center">
							{detectionResults ? (
								<DetectImage
									src={previewUrl}
									alt="Detect结果"
									className="max-h-[300px] rounded-lg shadow-sm"
									predictions={detectionResults?.predictions || []}
								/>
							) : (
								<Image
									src={previewUrl}
									alt="预览图"
									className="max-h-[300px] rounded-lg shadow-sm"
								/>
							)}
						</div>
					)}
				</Card>

				{/* 上传按钮 */}
				<Button
					ref={buttonRef}
					type="primary"
					onClick={handleUploadAndPredict}
					disabled={!selectedImage || loading || !serviceId || !configId}
					block
					className={clsx(
						"h-10",
						"rounded-lg",
						"shadow-sm hover:shadow-md",
						"transition-all duration-300"
					)}
				>
					{loading ? (
						<>
							<LoadingOutlined /> 检测中...
						</>
					) : (
						"开始检测"
					)}
				</Button>

				{/* 错误提示 */}
				{error && (
					<Alert
						message={error}
						type="error"
						showIcon
						closable
						onClose={() => setError(null)}
						className="rounded-lg"
					/>
				)}

				{/* 检测结果 */}
				{detectionResults && (
					<Card title="检测结果" size="small" className="bg-gray-50">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto">
							{detectionResults?.predictions?.map((prediction, index) => (
								<DiagnosisResultCard key={index} prediction={prediction} />
							))}
						</div>
					</Card>
				)}

				{/* 匹配结果 */}
				{detectionResults?.matchResults && detectionResults.matchResults.length > 0 && (
					<Card title="病害匹配结果" size="small" className="bg-gray-50">
						<div className="space-y-4">
							{detectionResults.matchResults.map((matchResult, index) => (
								<DiagnosisMatchResultCard key={index} matchResult={matchResult} />
							))}
						</div>
					</Card>
				)}

				{/* 反馈 */}
				{diagnosisId && !loading && (
					<Button
						type="primary"
						onClick={() => feedbackSubmitModalRef.current?.open(diagnosisId)}
						className="mt-4"
					>
						有疑问？点击进行反馈
					</Button>
				)}
				<FeedbackSubmitModal ref={feedbackSubmitModalRef} />
			</Space>
		</Card>
	);
};

export default DiseaseDiagnose;
