import { ResUploadFile } from "@/api/interface";
import { uploadChunksFile, uploadSingleFile } from "@/api/modules/file";
import { BarsOutlined, DeleteFilled, FolderOutlined, UploadOutlined } from "@ant-design/icons";
import {
	Button,
	Empty,
	Flex,
	message,
	notification,
	Space,
	Switch,
	Tooltip,
	Upload,
	UploadFile
} from "antd";
import { RcFile, UploadChangeParam } from "antd/lib/upload";
import React, { useState } from "react";
import styles from "./index.module.scss"; // 引入样式

const { Dragger } = Upload;

export type FileUploadProps = {
	onUpload?: () => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [directoryMode, setDirectoryMode] = useState<boolean>(false);
	const [multipleMode, setMultipleMode] = useState<boolean>(false);
	const [api, contextHolder] = notification.useNotification();

	// 自定义文件上传处理
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
								const newFileList = [...prev];
								newFileList[index].percent = progress;
								return newFileList;
							});
						}
					});

			if (response?.code === 200 || response?.code === 201) {
				onSuccess?.(null, file);
				onUpload?.();
			} else {
				throw new Error(response?.message);
			}
		} catch (error: any) {
			onError?.(error);
			message.error("上传失败");
		}
	};

	// 处理文件变化
	const handleChange = ({ fileList }: UploadChangeParam<UploadFile<ResUploadFile>>) => {
		setFileList(fileList);
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
					<Dragger
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
					</Dragger>
					{/* 控制开关 */}
					<Flex align="center" justify="space-between" wrap>
						<Space style={{ marginTop: 16 }}>
							<Tooltip title="开启后可以上传目录">
								<span>目录模式：</span>
							</Tooltip>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={directoryMode}
								onChange={handleDirectoryModeChange}
							/>
						</Space>
						<Space style={{ marginTop: 16 }}>
							<Tooltip title="开启后可以上传多个文件">
								<span>多文件模式：</span>
							</Tooltip>
							<Switch
								checkedChildren="开启"
								unCheckedChildren="关闭"
								checked={multipleMode}
								onChange={handleMultipleModeChange}
							/>
						</Space>
					</Flex>
				</div>

				{/* 显示文件上传列表，包含图片预览 */}
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
