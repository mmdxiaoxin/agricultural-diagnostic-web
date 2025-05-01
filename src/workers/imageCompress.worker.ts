import Compressor from "compressorjs";

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
			const compressedBlob = await new Promise<Blob>((resolve, reject) => {
				new Compressor(blob, {
					quality,
					maxWidth,
					maxHeight,
					success: result => {
						resolve(result);
					},
					error: err => {
						reject(err);
					}
				});
			});

			self.postMessage({ type: "success", data: compressedBlob });
		} catch (error) {
			self.postMessage({
				type: "error",
				error: error instanceof Error ? error.message : "压缩失败"
			});
		}
	}
};
