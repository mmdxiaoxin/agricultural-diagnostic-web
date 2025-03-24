import { Prediction } from "@/api/interface/diagnosis";
import React, { useEffect, useRef, useState } from "react";

interface DetectImageProps {
	imageUrl: string;
	predictions: Prediction[];
	className?: string;
}

const DetectImage: React.FC<DetectImageProps> = ({ imageUrl, predictions, className }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	// 计算缩放比例
	const calculateScale = (containerWidth: number, imageWidth: number, imageHeight: number) => {
		const scale = containerWidth / imageWidth;
		return {
			scale,
			width: imageWidth * scale,
			height: imageHeight * scale
		};
	};

	useEffect(() => {
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			setImageSize({ width: img.width, height: img.height });
		};
	}, [imageUrl]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const { scale, width, height } = calculateScale(
			container.clientWidth,
			imageSize.width,
			imageSize.height
		);

		// 设置画布尺寸为缩放后的尺寸
		canvas.width = width;
		canvas.height = height;

		// 绘制图片
		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			// 绘制图片
			ctx.drawImage(img, 0, 0, width, height);

			// 绘制检测框
			predictions.forEach(prediction => {
				if (prediction.type !== "detect") return;

				const bbox = prediction.bbox;
				const x = bbox.x * scale;
				const y = bbox.y * scale;
				const width = bbox.width * scale;
				const height = bbox.height * scale;

				// 设置边框样式
				ctx.strokeStyle = "#00ff00";
				ctx.lineWidth = 2;

				// 绘制边框
				ctx.strokeRect(x, y, width, height);

				// 设置标签背景
				ctx.fillStyle = "#00ff00";
				ctx.font = "14px Arial";
				const label = `${prediction.class_name} ${(prediction.confidence * 100).toFixed(1)}%`;
				const labelWidth = ctx.measureText(label).width;
				const labelHeight = 20;

				// 绘制标签背景
				ctx.fillRect(x, y - labelHeight, labelWidth + 10, labelHeight);

				// 绘制标签文字
				ctx.fillStyle = "#ffffff";
				ctx.fillText(label, x + 5, y - 5);
			});
		};
	}, [imageUrl, predictions, imageSize]);

	return (
		<div ref={containerRef} className="relative w-full">
			<img
				src={imageUrl}
				alt="检测图片"
				className={className}
				style={{
					width: "100%",
					height: "auto",
					display: "block"
				}}
			/>
			<canvas
				ref={canvasRef}
				className="absolute top-0 left-0 w-full h-full"
				style={{ pointerEvents: "none" }}
			/>
		</div>
	);
};

export default DetectImage;
