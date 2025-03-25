import { fileType_COLOR, MIME_TYPE, MIMETypeValue } from "@/constants";

/**
 * @description 获取模型文件 MIME 类型
 * @param {String} extension 文件扩展名
 * @return string
 */
export const getModelMimeType = (extension: string): string => {
	const modelMimeTypes: { [key: string]: string } = {
		pth: "application/pytorch-model",
		pt: "application/pytorch-model",
		h5: "application/tensorflow-model",
		pb: "application/tensorflow-model",
		onnx: "application/onnx-model",
		caffemodel: "application/caffe-model",
		weights: "application/darknet-weights",
		params: "application/mxnet-model",
		bin: "application/huggingface-model"
	};

	return modelMimeTypes[extension.toLowerCase()] || "application/octet-stream";
};

/**
 * @description 获取文件类型对应颜色
 * @param {String} mimeType 文件类型
 * @return string
 */
export function getFileTypeColor(mimeType: string): string {
	// 检查文件类型并返回对应颜色
	if (Object.values(MIME_TYPE.Video).includes(mimeType as any)) {
		return fileType_COLOR.Video;
	} else if (Object.values(MIME_TYPE.Audio).includes(mimeType as any)) {
		return fileType_COLOR.Audio;
	} else if (Object.values(MIME_TYPE.Image).includes(mimeType as any)) {
		return fileType_COLOR.Image;
	} else if (Object.values(MIME_TYPE.Application).includes(mimeType as any)) {
		return fileType_COLOR.Application;
	} else if (Object.values(MIME_TYPE.Archive).includes(mimeType as any)) {
		return fileType_COLOR.Application;
	} else if (Object.values(MIME_TYPE.Font).includes(mimeType as any)) {
		return fileType_COLOR.Application;
	} else if (Object.values(MIME_TYPE.Other).includes(mimeType as any)) {
		return fileType_COLOR.other;
	} else {
		return fileType_COLOR.other;
	}
}

/**
 * @description 获取二级文件类型
 * @param {String} type 一级文件类型
 * @return array
 */
export const getFileType = (type: string): MIMETypeValue[] => {
	switch (type) {
		case "image":
			return Object.values(MIME_TYPE.Image);
		case "video":
			return [...Object.values(MIME_TYPE.Video)];
		case "application":
			return [...Object.values(MIME_TYPE.Application)];
		case "audio":
			return [...Object.values(MIME_TYPE.Audio)];
		case "archive":
			return [...Object.values(MIME_TYPE.Archive)];
		case "other":
			return [...Object.values(MIME_TYPE.Other), ...Object.values(MIME_TYPE.Font)];
		default:
			return [];
	}
};
