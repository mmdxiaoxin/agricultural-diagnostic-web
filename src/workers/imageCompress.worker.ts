interface CompressMessage {
	type: "compress";
	data: {
		blob: Blob;
		maxWidth: number;
		maxHeight: number;
		quality: number;
	};
}

self.onmessage = async (e: MessageEvent<CompressMessage>) => {
	if (e.data.type === "compress") {
		const { blob, maxWidth, maxHeight, quality } = e.data.data;

		try {
			const compressedBlob = await compressImage(blob, maxWidth, maxHeight, quality);
			self.postMessage({ type: "success", data: compressedBlob });
		} catch (error) {
			self.postMessage({
				type: "error",
				error: error instanceof Error ? error.message : "压缩失败"
			});
		}
	}
};

async function compressImage(
	blob: Blob,
	maxWidth: number,
	maxHeight: number,
	quality: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = new OffscreenCanvas(maxWidth, maxHeight);
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				reject(new Error("无法创建画布上下文"));
				return;
			}

			// 计算缩放比例
			const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

			// 计算新的尺寸
			const newWidth = img.width * scale;
			const newHeight = img.height * scale;

			// 绘制图像
			ctx.drawImage(img, 0, 0, newWidth, newHeight);

			// 转换为Blob
			canvas
				.convertToBlob({ type: "image/jpeg", quality })
				.then(compressedBlob => {
					if (compressedBlob) {
						resolve(compressedBlob);
					} else {
						reject(new Error("压缩失败"));
					}
				})
				.catch(reject);
		};

		img.onerror = () => reject(new Error("图片加载失败"));
		img.src = URL.createObjectURL(blob);
	});
}
