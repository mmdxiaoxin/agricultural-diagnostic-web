import { Prediction } from "@/api/interface/diagnosis";
import { Image, ImageProps } from "antd";
import React, { useEffect, useState } from "react";

export type DetectImageProps = Omit<ImageProps, "src" | "alt"> & {
	imageUrl: string;
	predictions: Prediction[];
};

const DetectImage: React.FC<DetectImageProps> = ({ imageUrl, predictions, ...props }) => {
	const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		// 获取图片尺寸
		const img = document.createElement("img");
		img.src = imageUrl;
		img.onload = () => {
			setImageSize({ width: img.width, height: img.height });
		};
	}, [imageUrl]);

	useEffect(() => {
		if (!imageSize.width || !imageSize.height) return;

		// 创建 Worker
		const worker = new Worker(new URL("@/workers/imageWorker.ts", import.meta.url), {
			type: "module"
		});

		// 处理 Worker 消息
		worker.onmessage = e => {
			if (e.data.success) {
				setProcessedImageUrl(e.data.data);
			} else {
				console.error("图像处理失败:", e.data.error);
			}
			worker.terminate();
		};

		// 发送数据到 Worker
		worker.postMessage({
			imageUrl,
			predictions,
			width: imageSize.width,
			height: imageSize.height
		});

		// 清理函数
		return () => {
			worker.terminate();
		};
	}, [imageUrl, predictions, imageSize]);

	return <Image src={processedImageUrl || imageUrl} alt="检测图片" {...props} />;
};

export default DetectImage;
