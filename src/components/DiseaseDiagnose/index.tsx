import { RemoteService } from "@/api/interface";
import type { DiagnoseResult, Prediction } from "@/api/interface/diagnosis";
import { getDiagnosisSupport, startDiagnosis, uploadDiagnosisImage } from "@/api/modules";
import { DIAGNOSIS_CLASS_NAME_ZH_CN } from "@/constants/diagnosis";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Cascader,
	Image,
	message,
	Space,
	Tag,
	Typography,
	Upload,
	UploadFile,
	UploadProps
} from "antd";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import DetectImage from "../DetectImage";

const { Text } = Typography;

export interface DiseaseDiagnoseProps {
	onPredict?: (image: File) => void;
}

const DiseaseDiagnose: React.FC<DiseaseDiagnoseProps> = ({ onPredict }) => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [detectionResults, setDetectionResults] = useState<DiagnoseResult>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [serviceId, setServiceId] = useState<number>();
	const [configId, setConfigId] = useState<number>();
	const [serviceList, setServiceList] = useState<RemoteService[]>([]);

	const fetchServiceList = async () => {
		const res = await getDiagnosisSupport();
		if (res.code !== 200 && res.code !== 201) throw new Error("获取服务列表失败，请重试！");
		if (!res.data) throw new Error("获取服务列表失败，请重试！");
		setServiceList(res.data);
	};

	useEffect(() => {
		fetchServiceList();
	}, []);

	// 构建级联选择器的选项
	const cascaderOptions = serviceList.map(service => ({
		value: service.id,
		label: service.serviceName,
		children: service.configs.map(config => ({
			value: config.id,
			label: config.name
		}))
	}));

	// 处理级联选择器的变化
	const handleCascaderChange = (value: (number | string)[]) => {
		if (value.length === 2) {
			setServiceId(value[0] as number);
			setConfigId(value[1] as number);
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

	// 渲染分类结果
	const renderClassifyResult = (prediction: Prediction) => {
		if (prediction.type !== "classify") return null;
		return (
			<Card key={prediction.class_name} className="mb-4">
				<Space direction="vertical" className="w-full">
					<Space>
						<Tag color="blue">分类结果</Tag>
						<Text strong>
							{DIAGNOSIS_CLASS_NAME_ZH_CN[
								prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
							] || prediction.class_name}
						</Text>
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
						<Text strong>
							{DIAGNOSIS_CLASS_NAME_ZH_CN[
								prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
							] || prediction.class_name}
						</Text>
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
							X: {prediction.bbox.x.toFixed(2)}, Y: {prediction.bbox.y.toFixed(2)}
						</Text>
					</Space>
				</Space>
			</Card>
		);
	};

	return (
		<Card title="图片诊断" className="max-w-3xl" variant="borderless">
			<Space direction="vertical" className="w-full" size="large">
				<Cascader
					options={cascaderOptions}
					allowClear={false}
					onChange={handleCascaderChange}
					placeholder="请选择诊断服务和配置"
					className="w-full"
					value={serviceId && configId ? [serviceId, configId] : undefined}
					maxTagCount={1}
					maxTagPlaceholder={omittedValues => `+ ${omittedValues.length} 项`}
					showSearch={{
						filter: (inputValue, path) =>
							path.some(
								option =>
									(option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
							)
					}}
					displayRender={labels => (
						<div className="flex items-center gap-1">
							{labels.map((label, index) => (
								<React.Fragment key={index}>
									<Text
										ellipsis={{ tooltip: label }}
										className={index === 0 ? "text-blue-500" : "text-gray-600"}
										style={{ maxWidth: 150 }}
									>
										{label}
									</Text>
									{index < labels.length - 1 && <span className="mx-1">/</span>}
								</React.Fragment>
							))}
						</div>
					)}
					dropdownRender={menu => <div className="max-h-[300px] overflow-y-auto">{menu}</div>}
					popupClassName={clsx(
						"[&_.ant-cascader-menu]:min-w-[120px]",
						"[&_.ant-cascader-menu]:max-w-[200px]",
						"[&_.ant-cascader-menu-item]:px-2",
						"[&_.ant-cascader-menu-item]:py-1",
						"[&_.ant-typography]:block",
						"[&_.ant-typography]:max-w-full",
						"[&_.ant-cascader-picker-label]:max-w-full"
					)}
				/>
				{/* 图片选择与预览 */}
				<Card size="small" className="bg-gray-50">
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
						<Space direction="vertical" className="w-full" size="middle">
							{detectionResults?.predictions?.map((prediction, index) => (
								<React.Fragment key={index}>
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
