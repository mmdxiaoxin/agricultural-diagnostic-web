import { DetectPrediction } from "@/api/interface";
import { DIAGNOSIS_CLASS_NAME_ZH_CN } from "@/constants/diagnosis";

interface WorkerMessage {
	imageUrl: string;
	predictions: DetectPrediction[];
	width: number;
	height: number;
}

// 预定义的颜色数组
const COLORS = [
	"#FF0000", // 红色
	"#00FF00", // 绿色
	"#0000FF", // 蓝色
	"#FFA500", // 橙色
	"#800080", // 紫色
	"#008080", // 青色
	"#FFC0CB", // 粉色
	"#A52A2A", // 棕色
	"#808080", // 灰色
	"#FFD700" // 金色
];

// 获取类别的颜色
function getClassColor(className: string): string {
	// 使用字符串的字符编码总和来确定颜色索引
	const hash = className.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return COLORS[hash % COLORS.length];
}

// 计算缩放因子
function calculateScale(width: number, height: number): number {
	// 基准分辨率（1920x1080）
	const baseWidth = 1920;
	const baseHeight = 1080;

	// 计算宽度和高度的缩放比例
	const scaleWidth = width / baseWidth;
	const scaleHeight = height / baseHeight;

	// 取较小的缩放比例，确保不会过大
	return Math.min(scaleWidth, scaleHeight, 1.5);
}

// 绘制带背景的标签
function drawLabel(
	ctx: OffscreenCanvasRenderingContext2D,
	x: number,
	y: number,
	text: string,
	color: string,
	scale: number
) {
	// 根据缩放因子计算字体大小和标签高度
	const fontSize = Math.max(12, Math.round(14 * scale));
	const labelHeight = Math.max(16, Math.round(20 * scale));
	const padding = Math.max(3, Math.round(5 * scale));

	// 设置字体
	ctx.font = `${fontSize}px Arial`;
	const labelWidth = ctx.measureText(text).width;

	// 绘制彩色背景
	ctx.fillStyle = color;
	ctx.fillRect(x, y, labelWidth + padding * 2, labelHeight);

	// 绘制白色文字
	ctx.fillStyle = "#ffffff";
	ctx.fillText(text, x + padding, y + labelHeight - padding);
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
	const { imageUrl, predictions, width, height } = e.data;

	try {
		// 创建离屏 canvas
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("无法获取 canvas 上下文");

		// 计算缩放因子
		const scale = calculateScale(width, height);

		// 加载图片
		const img = await loadImage(imageUrl);

		// 绘制图片
		ctx.drawImage(img, 0, 0, width, height);

		// 绘制检测框
		for (const prediction of predictions) {
			if (prediction.type !== "detect") continue;

			const bbox = prediction.bbox;
			const x = bbox.x;
			const y = bbox.y;
			const w = bbox.width;
			const h = bbox.height;

			// 根据类别名称获取颜色
			const color = getClassColor(prediction.class_name);

			// 设置边框样式
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.max(1, Math.round(2 * scale));

			// 绘制边框
			ctx.strokeRect(x, y, w, h);

			// 绘制标签（放在框内左上角）
			const label = `${
				DIAGNOSIS_CLASS_NAME_ZH_CN[
					prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
				] || prediction.class_name
			} ${(prediction.confidence * 100).toFixed(1)}%`;
			drawLabel(ctx, x + 5, y + 5, label, color, scale);
		}

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
