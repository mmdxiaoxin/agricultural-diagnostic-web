import { Prediction } from "@/api/interface/diagnosis";
import React, { useEffect, useRef } from "react";

interface DetectImageProps {
	imageUrl: string;
	predictions: Prediction[];
	className?: string;
}

const DetectImage: React.FC<DetectImageProps> = ({ imageUrl, predictions, className }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const img = new Image();
		img.src = imageUrl;
		img.onload = () => {
			// 设置画布尺寸为图片尺寸
			canvas.width = img.width;
			canvas.height = img.height;

			// 绘制图片
			ctx.drawImage(img, 0, 0);

			// 绘制检测框
			predictions.forEach(prediction => {
				if (prediction.type !== "detect") return;

				const bbox = prediction.bbox;
				const x = bbox.x;
				const y = bbox.y;
				const width = bbox.width;
				const height = bbox.height;

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
	}, [imageUrl, predictions]);

	return (
		<div className="relative">
			<img src={imageUrl} alt="检测图片" className={className} />
			<canvas
				ref={canvasRef}
				className="absolute top-0 left-0 w-full h-full"
				style={{ pointerEvents: "none" }}
			/>
		</div>
	);
};

export default DetectImage;
