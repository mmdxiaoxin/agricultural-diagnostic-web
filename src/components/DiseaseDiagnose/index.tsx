import { ResStartDiagnoseDisease } from "@/api/interface";
import type { Prediction } from "@/api/interface/diagnosis";
import { startDiagnosis, uploadDiagnosisImage } from "@/api/modules";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Image,
	message,
	Space,
	Tag,
	Typography,
	Upload,
	UploadFile,
	UploadProps
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;

const DiseaseDiagnose: React.FC = () => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [detectionResults, setDetectionResults] = useState<ResStartDiagnoseDisease>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	// 上传并预测
	const handleUploadAndPredict = async () => {
		if (!selectedImage) {
			setError("请选择一张图片上传！");
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

			// * 开始诊断
			const diagnoseRes = await startDiagnosis({ diagnosisId, serviceId: 2 });
			if (diagnoseRes.code !== 200 && diagnoseRes.code !== 201)
				throw new Error("检测失败，请重试！");
			setDetectionResults(diagnoseRes.data);
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

	// 渲染分类结果
	const renderClassifyResult = (prediction: Prediction) => {
		if (prediction.type !== "classify") return null;
		return (
			<Card key={prediction.class_name} className="mb-4">
				<Space direction="vertical" className="w-full">
					<Space>
						<Tag color="blue">分类结果</Tag>
						<Text strong>{prediction.class_name}</Text>
					</Space>
					<Space>
						<Text type="secondary">置信度：</Text>
						<Text strong className="text-blue-500">
							{(prediction.confidence * 100).toFixed(2)}%
						</Text>
					</Space>
				</Space>
			</Card>
		);
	};

	// 渲染检测结果
	const renderDetectResult = (prediction: Prediction) => {
		if (prediction.type !== "detect") return null;
		return (
			<Card key={prediction.class_id} className="mb-4">
				<Space direction="vertical" className="w-full">
					<Space>
						<Tag color="green">检测结果</Tag>
						<Text strong>{prediction.class_name}</Text>
					</Space>
					<Space>
						<Text type="secondary">置信度：</Text>
						<Text strong className="text-blue-500">
							{(prediction.confidence * 100).toFixed(2)}%
						</Text>
					</Space>
					<Space>
						<Text type="secondary">位置：</Text>
						<Text>
							X: {prediction.bbox[0].x.toFixed(2)}, Y: {prediction.bbox[0].y.toFixed(2)}
						</Text>
					</Space>
				</Space>
			</Card>
		);
	};

	return (
		<Card title="植物病害诊断" className="max-w-3xl">
			<Space direction="vertical" className="w-full" size="large">
				{/* 图片选择与预览 */}
				<Card size="small" className="bg-gray-50">
					<Upload
						accept="image/*"
						beforeUpload={file => {
							setSelectedImage(file);
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
						<Button icon={<UploadOutlined />}>选择图片</Button>
					</Upload>
					{previewUrl && (
						<div className="mt-4 text-center">
							<Image src={previewUrl} alt="预览图" className="max-h-[300px]" />
						</div>
					)}
				</Card>

				{/* 上传按钮 */}
				<Button
					type="primary"
					onClick={handleUploadAndPredict}
					disabled={!selectedImage || loading}
					block
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
					<Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
				)}

				{/* 检测结果 */}
				{detectionResults && (
					<Card title="检测结果" size="small">
						<Space direction="vertical" className="w-full" size="middle">
							{detectionResults.predictions.map(prediction => (
								<React.Fragment
									key={prediction.type === "classify" ? prediction.class_name : prediction.class_id}
								>
									{prediction.type === "classify" && renderClassifyResult(prediction)}
									{prediction.type === "detect" && renderDetectResult(prediction)}
								</React.Fragment>
							))}
						</Space>
					</Card>
				)}
			</Space>
		</Card>
	);
};

export default DiseaseDiagnose;
