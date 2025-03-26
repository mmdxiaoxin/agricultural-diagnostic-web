interface Prediction {
	type: string;
	class_name: string;
	confidence: number;
	bbox: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

interface WorkerMessage {
	imageUrl: string;
	predictions: Prediction[];
	width: number;
	height: number;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
	const { imageUrl, predictions, width, height } = e.data;

	try {
		// 创建离屏 canvas
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("无法获取 canvas 上下文");

		// 加载图片
		const img = await loadImage(imageUrl);

		// 绘制图片
		ctx.drawImage(img, 0, 0, width, height);

		// 绘制检测框
		predictions.forEach(prediction => {
			if (prediction.type !== "detect") return;

			const bbox = prediction.bbox;
			const x = bbox.x;
			const y = bbox.y;
			const w = bbox.width;
			const h = bbox.height;

			// 设置边框样式
			ctx.strokeStyle = "#00ff00";
			ctx.lineWidth = 2;

			// 绘制边框
			ctx.strokeRect(x, y, w, h);

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

		// 转换为 blob
		const blob = await canvas.convertToBlob();

		// 转换为 base64
		const reader = new FileReader();
		reader.onloadend = () => {
			self.postMessage({ success: true, data: reader.result });
		};
		reader.readAsDataURL(blob);
	} catch (error: any) {
		self.postMessage({ success: false, error: error.message });
	}
};

function loadImage(url: string): Promise<ImageBitmap> {
	return fetch(url)
		.then(response => response.blob())
		.then(blob => createImageBitmap(blob));
}
