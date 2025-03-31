import { uploadChunksFile, uploadSingleFile } from "@/api/modules/file";
import { DeleteFilled, FileOutlined, FolderOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Empty, Space, Switch, Upload, message, notification } from "antd";
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload";
import clsx from "clsx";
import React, { useState } from "react";

export type FileUploadProps = {
	onUpload?: () => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [directoryMode, setDirectoryMode] = useState<boolean>(false);
	const [multipleMode, setMultipleMode] = useState<boolean>(false);
	const [api, contextHolder] = notification.useNotification();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// 自定义文件上传处理（单文件或分片上传）
	const customRequest = async (options: any) => {
		const { onSuccess, onError, file: RcFile } = options;
		const file = RcFile as RcFile | null;
		if (!file) {
			message.error("文件不能为空");
			return;
		}

		const fileType = file.type;
		const fileSize = file.size;
		const chunkSize = fileType.startsWith("video") ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
		const isSingle = fileSize <= chunkSize;

		try {
			const response = isSingle
				? await uploadSingleFile(file)
				: await uploadChunksFile(file, {
						chunkSize,
						onProgress(fileId, progress) {
							setFileList(prev => {
								const index = prev.findIndex(item => item.uid === fileId);
								if (index !== -1) {
									const newFileList = [...prev];
									newFileList[index].percent = progress;
									return newFileList;
								}
								return prev;
							});
						}
					});

			if (response?.code === 200 || response?.code === 201) {
				onSuccess?.(null, file);
			} else {
				throw new Error(response?.message);
			}
		} catch (error: any) {
			onError?.(error);
			message.error("上传失败");
		}
	};

	// 文件变化处理：更新 fileList
	const handleChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
		setFileList(fileList);
		if (fileList.length > 0 && fileList.every(file => file.status === "done")) {
			onUpload?.();
		}
	};

	// 控制文件和目录模式互斥
	const handleDirectoryModeChange = (checked: boolean) => {
		if (multipleMode && checked) {
			api.warning({
				message: "模式冲突",
				description: "无法同时开启目录模式和多文件模式。已关闭多文件模式。"
			});
			setMultipleMode(false);
		}
		setDirectoryMode(checked);
	};

	const handleMultipleModeChange = (checked: boolean) => {
		if (directoryMode && checked) {
			api.warning({
				message: "模式冲突",
				description: "无法同时开启目录模式和多文件模式。已关闭目录模式。"
			});
			setDirectoryMode(false);
		}
		setMultipleMode(checked);
	};

	const getOptionText = ({ directory, multiple }: { directory: boolean; multiple: boolean }) => {
		if (directory) return "目录";
		if (multiple) return "多个文件";
		return "文件";
	};

	const getOptionIcon = ({ directory, multiple }: { directory: boolean; multiple: boolean }) => {
		if (directory) return <FolderOutlined className="text-2xl" />;
		if (multiple) return <FileOutlined className="text-2xl" />;
		return <UploadOutlined className="text-2xl" />;
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newFiles = Array.from(files).map(file => ({
				uid: `-${Date.now()}-${Math.random().toString(36).slice(2)}`,
				name: file.name,
				status: "uploading" as const,
				percent: 0,
				originFileObj: file as unknown as RcFile,
				size: file.size,
				type: file.type,
				lastModifiedDate: new Date(file.lastModified)
			}));
			setFileList(prev => [...prev, ...newFiles]);
			newFiles.forEach(file => {
				customRequest({
					file: file.originFileObj,
					onSuccess: () => {
						setFileList(prev => {
							const index = prev.findIndex(item => item.uid === file.uid);
							if (index !== -1) {
								const newFileList = [...prev];
								newFileList[index] = { ...newFileList[index], status: "done", percent: 100 };
								return newFileList;
							}
							return prev;
						});
					},
					onError: () => {
						setFileList(prev => {
							const index = prev.findIndex(item => item.uid === file.uid);
							if (index !== -1) {
								const newFileList = [...prev];
								newFileList[index] = { ...newFileList[index], status: "error" };
								return newFileList;
							}
							return prev;
						});
					}
				});
			});
		}
		event.target.value = ""; // 清空input，允许重复选择同一文件
	};

	return (
		<>
			{contextHolder}
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				multiple={multipleMode}
				onChange={handleFileSelect}
			/>
			<div className="flex flex-col gap-6">
				{/* 拖拽上传区域 */}
				<div
					className={clsx(
						"relative",
						"rounded-2xl",
						"bg-gradient-to-br from-blue-50 to-indigo-50",
						"border-2 border-dashed border-blue-200",
						"transition-all duration-300",
						"hover:border-blue-400",
						"hover:shadow-lg"
					)}
				>
					<Upload.Dragger
						name="file"
						multiple={multipleMode}
						directory={directoryMode}
						customRequest={customRequest}
						onChange={handleChange}
						fileList={fileList}
						showUploadList={false}
						className={clsx("p-8", "bg-transparent", "border-none", "hover:bg-transparent")}
					>
						<div className="flex flex-col items-center gap-4">
							<div
								className={clsx(
									"w-16 h-16",
									"rounded-full",
									"bg-blue-100",
									"flex items-center justify-center",
									"text-blue-500",
									"transition-all duration-300",
									"group-hover:bg-blue-200"
								)}
							>
								{getOptionIcon({ directory: directoryMode, multiple: multipleMode })}
							</div>
							<div className="text-center">
								<p className="text-lg font-medium text-gray-800 mb-2">
									点击或拖拽{getOptionText({ directory: directoryMode, multiple: multipleMode })}
									到此区域上传
								</p>
								<p className="text-sm text-gray-500">支持单个文件、多个文件或整个文件夹上传</p>
							</div>
						</div>
					</Upload.Dragger>
				</div>

				{/* 控制开关 */}
				<div
					className={clsx(
						"flex justify-between items-center",
						"p-4",
						"rounded-xl",
						"bg-white",
						"shadow-sm",
						"border border-gray-100"
					)}
				>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<span className="text-gray-600">目录模式：</span>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={directoryMode}
								onChange={handleDirectoryModeChange}
								className="bg-gray-200"
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-gray-600">多文件模式：</span>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={multipleMode}
								onChange={handleMultipleModeChange}
								className="bg-gray-200"
							/>
						</div>
					</div>
					<Space>
						<Button
							icon={<UploadOutlined />}
							onClick={handleUploadClick}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							点击上传
						</Button>
						<Button
							icon={<DeleteFilled />}
							onClick={event => {
								event.stopPropagation();
								setFileList([]);
							}}
							danger
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							清空记录
						</Button>
					</Space>
				</div>

				{/* 显示上传列表 */}
				<div
					className={clsx(
						"flex-1",
						"p-6",
						"rounded-2xl",
						"bg-white",
						"shadow-sm",
						"border border-gray-100",
						"transition-all duration-300",
						"hover:shadow-md"
					)}
				>
					{fileList.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64">
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="暂无上传记录"
								className="text-gray-400"
							/>
						</div>
					) : (
						<Upload
							directory={directoryMode}
							multiple={multipleMode}
							listType="picture"
							fileList={fileList}
							onChange={handleChange}
							customRequest={customRequest}
							showUploadList={{ showRemoveIcon: true }}
							className="upload-list"
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default FileUpload;
