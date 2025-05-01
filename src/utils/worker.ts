/**
 * @description 计算文件 MD5 值
 * @param {File} file 文件对象
 * @return Promise
 */
export const calculateFileMd5 = (file: File) => {
	return new Promise<string>((resolve, reject) => {
		const worker = new Worker(new URL("@/workers/md5Computed.worker.ts", import.meta.url), {
			type: "module"
		});

		worker.onmessage = event => {
			resolve(event.data.md5);
			worker.terminate();
		};

		worker.onerror = error => {
			reject(error);
			worker.terminate();
		};

		worker.postMessage({ file });
	});
};
