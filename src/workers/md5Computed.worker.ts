import SparkMD5 from "spark-md5";

self.onmessage = async event => {
	const { file } = event.data;
	const fileReader = new FileReader();

	fileReader.onload = function () {
		const buffer = fileReader.result as ArrayBuffer;
		const md5 = SparkMD5.ArrayBuffer.hash(buffer);
		postMessage({ md5 });
	};

	fileReader.readAsArrayBuffer(file);
};
