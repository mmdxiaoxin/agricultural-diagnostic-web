import SparkMD5 from "spark-md5";

self.onmessage = async event => {
	const { file } = event.data;
	const fileReader = new FileReader();

	// 用于存储已读取的字节
	let fileSize = file.size;
	let loaded = 0;

	// 监听文件读取进度
	fileReader.onprogress = e => {
		if (e.lengthComputable) {
			loaded = e.loaded;
			const progress = (loaded / fileSize) * 100;
			postMessage({ progress });
		}
	};

	fileReader.onload = function () {
		const buffer = fileReader.result as ArrayBuffer;
		const md5 = SparkMD5.ArrayBuffer.hash(buffer);
		postMessage({ md5 });
	};

	fileReader.onerror = (error: any) => {
		postMessage({ error: error.message });
	};

	fileReader.readAsArrayBuffer(file);
};
