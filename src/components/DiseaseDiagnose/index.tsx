import { ResStartDiagnoseDisease } from "@/api/interface";
import { startDiagnosis, uploadDiagnosisImage } from "@/api/modules";
import { UploadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, message, Spin, Upload, UploadFile, UploadProps } from "antd";
import React, { useState } from "react";

const DiseaseDiagnose: React.FC = () => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [detectionResults, setDetectionResults] = useState<ResStartDiagnoseDisease>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

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

	return (
		<Card title="上传图片进行检测" style={{ margin: "20px auto" }}>
			{/* 图片选择与预览 */}
			<Upload
				accept="image/*"
				beforeUpload={file => {
					setSelectedImage(file);
					return false; // 阻止自动上传
				}}
				showUploadList={{
					showPreviewIcon: true // 显示预览图标
				}}
				fileList={fileList}
				onChange={handleChange}
				listType="picture"
				previewFile={file => {
					// 使用 Ant Design 提供的默认预览逻辑
					return Promise.resolve(URL.createObjectURL(file as Blob));
				}}
				style={{ marginBottom: 16 }}
			>
				<Button icon={<UploadOutlined />}>选择图片</Button>
			</Upload>

			{/* 上传按钮 */}
			<Button
				type="primary"
				onClick={handleUploadAndPredict}
				disabled={!selectedImage || loading}
				style={{ width: "100%", marginTop: 16 }}
			>
				{loading ? "检测中..." : "上传并检测"}
			</Button>
			{loading && <Spin style={{ display: "block", margin: "16px auto" }} />}

			{/* 错误提示 */}
			{error && (
				<Alert
					message={error}
					type="error"
					showIcon
					closable
					style={{ marginTop: 16 }}
					onClose={() => setError(null)}
				/>
			)}

			{/* 检测结果 */}
			{detectionResults && (
				<div>
					<h3>检测结果</h3>
					<p>{detectionResults.predictions.map(p => p.class_name).join(", ")}</p>
				</div>
			)}
		</Card>
	);
};

export default DiseaseDiagnose;
