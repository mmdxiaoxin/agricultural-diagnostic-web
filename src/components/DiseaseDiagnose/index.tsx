import { diagnoseDisease } from "@/api/modules/diagnosis";
import { uploadSingleFile } from "@/api/modules/file";
import { UploadOutlined } from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Divider,
	Image,
	message,
	Spin,
	Upload,
	UploadFile,
	UploadProps
} from "antd";
import React, { useState } from "react";

interface DetectionResult {
	class_name: string;
	bbox: number[];
	score: number;
	class_id: number;
}

const DiseaseDiagnose: React.FC = () => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
	const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// 上传并预测
	const handleSubmit = async () => {
		if (!selectedImage) {
			setError("请选择一张图片上传！");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await uploadSingleFile(selectedImage);
			if (response.code !== 200 && response.code !== 201) throw new Error("上传失败，请重试！");
			if (!response.data) throw new Error("上传失败，请重试！");
			const fileId = response.data.id;

			const diagnoseResponse = await diagnoseDisease(String(fileId));
			if (diagnoseResponse.code !== 200 && diagnoseResponse.code !== 201)
				throw new Error("检测失败，请重试！");
			const { processed_image, detections } = diagnoseResponse.data;

			setResultImageUrl(processed_image);
			setDetectionResults(detections);
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
					setResultImageUrl(null); // 清空之前的检测结果
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
				onClick={handleSubmit}
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
			{resultImageUrl && (
				<div style={{ marginTop: 16 }}>
					<Divider>检测结果</Divider>
					<Image src={resultImageUrl} alt="检测结果" style={{ maxWidth: "100%", maxHeight: 300 }} />
					<div style={{ marginTop: 16 }}>
						<h4>检测到的物体:</h4>
						<ul>
							{detectionResults.map((result, index) => (
								<li key={index}>
									<strong>{result.class_name}</strong> (置信度: {Math.round(result.score * 100)}%)
									<br />
									边框: [X: {result.bbox[0]}, Y: {result.bbox[1]}, W: {result.bbox[2]}, H:{" "}
									{result.bbox[3]}]
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</Card>
	);
};

export default DiseaseDiagnose;
