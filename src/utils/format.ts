/**
 * @description 用于换算单位的函数
 * @param {Number} sizeInBytes 文件大小（字节）
 * @return string
 */
export const formatSize = (sizeInBytes: number) => {
	if (sizeInBytes >= 1_000_000_000) {
		return (sizeInBytes / 1_000_000_000).toFixed(2) + " GB"; // GB
	} else if (sizeInBytes >= 1_000_000) {
		return (sizeInBytes / 1_000_000).toFixed(2) + " MB"; // MB
	} else if (sizeInBytes >= 1_000) {
		return (sizeInBytes / 1_000).toFixed(2) + " KB"; // KB
	} else {
		return sizeInBytes + " B"; // B
	}
};
