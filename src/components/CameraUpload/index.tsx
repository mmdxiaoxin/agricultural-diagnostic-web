import { CameraOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Select, message } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface CameraUploadProps {
	onCapture: (file: File) => void;
	loading?: boolean;
}

interface CameraDevice {
	deviceId: string;
	label: string;
	kind: string;
}

const videoConstraints = {
	width: 640,
	height: 640,
	facingMode: "environment"
};

const CameraUpload: React.FC<CameraUploadProps> = ({ onCapture, loading = false }) => {
	const webcamRef = useRef<Webcam>(null);
	const workerRef = useRef<Worker | null>(null);
	const [devices, setDevices] = useState<CameraDevice[]>([]);
	const [deviceId, setDeviceId] = useState<string>("");
	const [isCompressing, setIsCompressing] = useState(false);

	const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
		const videoDevices = mediaDevices
			.filter(({ kind }) => kind === "videoinput")
			.map(device => ({
				deviceId: device.deviceId,
				label: device.label || `摄像头 ${device.deviceId.slice(0, 5)}`,
				kind: device.kind
			}));
		setDevices(videoDevices);
		if (videoDevices.length > 0) {
			setDeviceId(videoDevices[0].deviceId);
		}
	}, []);

	useEffect(() => {
		navigator.mediaDevices.enumerateDevices().then(handleDevices);
	}, [handleDevices]);

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
				setIsCompressing(false);
			} else if (e.data.type === "error") {
				message.error(e.data.error);
				setIsCompressing(false);
			}
		};

		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
			}
		};
	}, [onCapture]);

	const capture = useCallback(() => {
		if (!webcamRef.current) return;

		const imageSrc = webcamRef.current.getScreenshot();
		if (!imageSrc) return;

		// 将 base64 转换为 Blob
		fetch(imageSrc)
			.then(res => res.blob())
			.then(blob => {
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
				}
			})
			.catch(err => {
				message.error("图片处理失败");
				console.error(err);
			});
	}, [onCapture]);

	const handleDeviceChange = (deviceId: string) => {
		setDeviceId(deviceId);
	};

	return (
		<div className="relative w-full">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col items-center gap-4"
			>
				<div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
					<Webcam
						ref={webcamRef}
						audio={false}
						videoConstraints={{
							...videoConstraints,
							deviceId: deviceId ? { exact: deviceId } : undefined
						}}
						className="w-full h-full object-cover"
						screenshotFormat="image/jpeg"
					/>
				</div>

				<div className="flex flex-col gap-4 w-full">
					{devices.length > 1 && (
						<Select
							value={deviceId}
							onChange={handleDeviceChange}
							className="w-full"
							placeholder="选择摄像头"
							disabled={isCompressing || loading}
						>
							{devices.map(device => (
								<Select.Option key={device.deviceId} value={device.deviceId}>
									{device.label}
								</Select.Option>
							))}
						</Select>
					)}

					<div className="flex gap-4 mb-4">
						<Button
							type="primary"
							icon={<CameraOutlined />}
							onClick={capture}
							disabled={isCompressing || loading}
							className={clsx(
								"h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"w-full"
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
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default CameraUpload;
