import React, { useState, useEffect } from "react";
import { Upload, message, notification, Button, Empty, Space, Switch } from "antd";
import { UploadOutlined, DeleteFilled, FolderOutlined, BarsOutlined } from "@ant-design/icons";
import { RcFile, UploadChangeParam, UploadFile } from "antd/lib/upload";
import { uploadChunksFile, uploadSingleFile } from "@/api/modules/file";
import styles from "./index.module.scss";

export type FileUploadProps = {
	onUpload?: () => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [directoryMode, setDirectoryMode] = useState<boolean>(false);
	const [multipleMode, setMultipleMode] = useState<boolean>(false);
	const [api, contextHolder] = notification.useNotification();

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
		if (directory) return <FolderOutlined />;
		if (multiple) return <BarsOutlined />;
		return <UploadOutlined />;
	};

	return (
		<>
			{contextHolder}
			<div className={styles.container}>
				{/* 拖拽上传区域 */}
				<div className={styles.draggerWrapper}>
					<Upload.Dragger
						name="file"
						multiple={multipleMode}
						directory={directoryMode}
						customRequest={customRequest}
						onChange={handleChange}
						fileList={fileList}
						showUploadList={false}
						style={{
							maxHeight: "200px",
							width: "100%",
							borderRadius: "10px",
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
						}}
					>
						<p className="ant-upload-drag-icon">
							{getOptionIcon({ directory: directoryMode, multiple: multipleMode })}
						</p>
						<p className="ant-upload-text">
							点击或拖拽{getOptionText({ directory: directoryMode, multiple: multipleMode })}
							到此区域上传
						</p>
					</Upload.Dragger>
					{/* 控制开关 */}
					<div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
						<div>
							<span>目录模式：</span>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={directoryMode}
								onChange={handleDirectoryModeChange}
							/>
						</div>
						<div>
							<span>多文件模式：</span>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={multipleMode}
								onChange={handleMultipleModeChange}
							/>
						</div>
					</div>
				</div>

				{/* 显示上传列表 */}
				<div className={styles.fileListWrapper}>
					<Upload
						directory={directoryMode}
						multiple={multipleMode}
						listType="picture"
						fileList={fileList}
						onChange={handleChange}
						customRequest={customRequest}
						showUploadList={{ showRemoveIcon: true }}
					>
						<Space wrap>
							<Button icon={<UploadOutlined />}>
								点击上传{getOptionText({ directory: directoryMode, multiple: multipleMode })}
							</Button>
							<Button
								icon={<DeleteFilled />}
								onClick={event => {
									event.stopPropagation();
									setFileList([]);
								}}
								danger
							>
								清空上传记录
							</Button>
						</Space>
					</Upload>

					{fileList.length === 0 && (
						<div className={styles.emptyWrapper}>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default FileUpload;
