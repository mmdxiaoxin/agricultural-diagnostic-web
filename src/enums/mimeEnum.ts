enum MimeType {
	// 视频文件类型
	VideoMP4 = "video/mp4",
	VideoAVI = "video/avi",
	VideoMPEG = "video/mpeg",
	VideoOGG = "video/ogg",
	VideoWebM = "video/webm",
	Video3GPP = "video/3gpp",
	VideoQuickTime = "video/quicktime",
	VideoXMSVideo = "video/x-msvideo",

	// 音频文件类型
	AudioMP3 = "audio/mpeg",
	AudioWAV = "audio/wav",
	AudioOGG = "audio/ogg",
	AudioAAC = "audio/aac",
	AudioFLAC = "audio/flac",
	AudioWebM = "audio/webm",
	AudioOpus = "audio/opus",

	// 图像文件类型
	ImageJPEG = "image/jpeg",
	ImagePNG = "image/png",
	ImageGIF = "image/gif",
	ImageWebP = "image/webp",
	ImageBMP = "image/bmp",
	ImageSVG = "image/svg+xml",
	ImageTIFF = "image/tiff",

	// 文档文件类型
	ApplicationPDF = "application/pdf",
	ApplicationWord = "application/msword",
	ApplicationExcel = "application/vnd.ms-excel",
	ApplicationPowerPoint = "application/vnd.ms-powerpoint",
	ApplicationWordOpenXML = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	ApplicationExcelOpenXML = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	ApplicationPPTXOpenXML = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	TextPlain = "text/plain",
	TextHTML = "text/html",
	TextCSS = "text/css",
	ApplicationJSON = "application/json",
	ApplicationXML = "application/xml",

	// 应用程序文件类型
	ApplicationZip = "application/zip",
	ApplicationRAR = "application/x-rar-compressed",
	ApplicationTAR = "application/x-tar",
	Application7z = "application/x-7z-compressed",
	ApplicationSH = "application/x-sh",
	ApplicationJAR = "application/java-archive",

	// 字体文件类型
	FontWOFF = "font/woff",
	FontWOFF2 = "font/woff2",
	ApplicationFontWOFF = "application/font-woff",
	ApplicationFontTTF = "application/font-ttf",
	ApplicationFontOTF = "application/font-otf",

	// 其他类型
	TextCSV = "text/csv",
	ApplicationPHP = "application/x-httpd-php",
	ApplicationOctetStream = "application/octet-stream"
}

export default MimeType;
