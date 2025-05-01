import { CameraOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Image, message, Select } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface CameraUploadProps {
	onCapture: (file: File) => void;
	loading?: boolean;
}

interface CameraDevice {
	deviceId: string;
	label: string;
	kind: string;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onCapture, loading = false }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [isCapturing, setIsCapturing] = useState(false);
	const [isCompressing, setIsCompressing] = useState(false);
	const [cameras, setCameras] = useState<CameraDevice[]>([]);
	const [currentCamera, setCurrentCamera] = useState<string>("");
	const workerRef = useRef<Worker | null>(null);

	// 获取所有摄像头设备
	const getCameras = async () => {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices
				.filter(device => device.kind === "videoinput")
				.map(device => ({
					deviceId: device.deviceId,
					label: device.label || `摄像头 ${device.deviceId.slice(0, 5)}`,
					kind: device.kind
				}));
			setCameras(videoDevices);
			if (videoDevices.length > 0) {
				setCurrentCamera(videoDevices[0].deviceId);
			}
		} catch (error) {
			message.error("获取摄像头列表失败");
		}
	};

	useEffect(() => {
		getCameras();
	}, []);

	useEffect(() => {
		// 初始化 Worker
		workerRef.current = new Worker(new URL("@/workers/imageCompress.worker.ts", import.meta.url), {
			type: "module"
		});

		// 监听 Worker 消息
		workerRef.current.onmessage = e => {
			if (e.data.type === "success") {
				const compressedBlob = e.data.data;
				const file = new File([compressedBlob], "capture.jpg", { type: "image/jpeg" });
				onCapture(file);

				// 显示预览
				const url = URL.createObjectURL(compressedBlob);
				setPreviewUrl(url);
				setIsCapturing(true);
				setIsCompressing(false);
				stopCamera();
			} else if (e.data.type === "error") {
				message.error(e.data.error);
				setIsCompressing(false);
			}
		};

		// 清理 Worker
		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
			}
		};
	}, [onCapture]);

	const startCamera = async (deviceId?: string) => {
		try {
			stopCamera(); // 先停止当前摄像头
			const constraints = {
				video: deviceId ? { deviceId: { exact: deviceId } } : true
			};
			const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
				setStream(mediaStream);
			}
		} catch (error) {
			message.error("无法访问摄像头，请确保已授予摄像头权限");
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			setStream(null);
		}
	};

	const handleCameraChange = (deviceId: string) => {
		setCurrentCamera(deviceId);
		startCamera(deviceId);
	};

	const captureImage = async () => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		if (!context) return;

		// 设置画布尺寸为640x640
		canvas.width = 640;
		canvas.height = 640;

		// 计算裁剪区域，保持视频的宽高比
		const videoAspectRatio = video.videoWidth / video.videoHeight;
		let sourceX = 0;
		let sourceY = 0;
		let sourceWidth = video.videoWidth;
		let sourceHeight = video.videoHeight;

		if (videoAspectRatio > 1) {
			sourceWidth = video.videoHeight;
			sourceX = (video.videoWidth - sourceWidth) / 2;
		} else {
			sourceHeight = video.videoWidth;
			sourceY = (video.videoHeight - sourceHeight) / 2;
		}

		// 绘制图像
		context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 640, 640);

		// 转换为Blob并发送给Worker进行压缩
		canvas.toBlob(
			blob => {
				if (!blob) return;

				// 如果图片大于1MB，进行压缩
				if (blob.size > 1024 * 1024) {
					setIsCompressing(true);
					workerRef.current?.postMessage({
						type: "compress",
						data: {
							blob,
							maxWidth: 640,
							maxHeight: 640,
							quality: 0.7
						}
					});
				} else {
					const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
					onCapture(file);

					// 显示预览
					const url = URL.createObjectURL(blob);
					setPreviewUrl(url);
					setIsCapturing(true);
					stopCamera();
				}
			},
			"image/jpeg",
			0.9
		);
	};

	return (
		<div className="relative w-full">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col items-center gap-4"
			>
				{!isCapturing ? (
					<div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
						<video
							ref={videoRef}
							autoPlay
							playsInline
							className={clsx("w-full h-full object-cover", !stream && "hidden")}
						/>
						<canvas ref={canvasRef} className="hidden" />
						{!stream && (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-center">
									<CameraOutlined className="text-4xl text-gray-400 mb-2" />
									<p className="text-gray-500">点击下方按钮开启摄像头</p>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="w-full aspect-square rounded-lg overflow-hidden">
						<Image src={previewUrl} alt="预览图" className="w-full h-full object-cover" />
					</div>
				)}

				<div className="flex flex-col gap-4 w-full">
					{!isCapturing && cameras.length > 1 && (
						<Select
							value={currentCamera}
							onChange={handleCameraChange}
							className="w-full"
							placeholder="选择摄像头"
							disabled={isCompressing || loading}
						>
							{cameras.map(camera => (
								<Select.Option key={camera.deviceId} value={camera.deviceId}>
									{camera.label}
								</Select.Option>
							))}
						</Select>
					)}

					<div className="flex gap-4">
						{!isCapturing ? (
							<>
								{!stream ? (
									<Button
										type="primary"
										icon={<CameraOutlined />}
										onClick={() => startCamera(currentCamera)}
										className={clsx(
											"h-10",
											"rounded-lg",
											"shadow-sm hover:shadow-md",
											"transition-all duration-300"
										)}
									>
										开启摄像头
									</Button>
								) : (
									<>
										<Button
											type="primary"
											icon={<CameraOutlined />}
											onClick={captureImage}
											disabled={isCompressing || loading}
											className={clsx(
												"h-10",
												"rounded-lg",
												"shadow-sm hover:shadow-md",
												"transition-all duration-300"
											)}
										>
											{isCompressing ? (
												<>
													<LoadingOutlined /> 压缩中...
												</>
											) : (
												"拍照"
											)}
										</Button>
										<Button
											onClick={stopCamera}
											disabled={isCompressing || loading}
											className={clsx(
												"h-10",
												"rounded-lg",
												"shadow-sm hover:shadow-md",
												"transition-all duration-300"
											)}
										>
											关闭摄像头
										</Button>
									</>
								)}
							</>
						) : (
							<Button
								onClick={() => {
									setPreviewUrl("");
									setIsCapturing(false);
									startCamera(currentCamera);
								}}
								disabled={loading}
								className={clsx(
									"h-10",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300"
								)}
							>
								重新拍照
							</Button>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default CameraUpload;
