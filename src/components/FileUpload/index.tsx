import { ResUploadFile } from "@/api/interface";
import { uploadChunksFile, uploadSingleFile } from "@/api/modules/file";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Empty, message, Progress, Space, Upload, UploadFile, UploadProps } from "antd";
import { RcFile, UploadChangeParam } from "antd/lib/upload";
import React, { useState } from "react";
import styles from "./index.module.scss"; // 引入样式

const { Dragger } = Upload;

export type FileUploadProps = {
	onUpload?: () => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	// 自定义文件上传处理
	const customRequest: UploadProps<null>["customRequest"] = async options => {
		const { onSuccess, onError, file: RcFile } = options;
		const file = RcFile as RcFile | null;
		if (!file) {
			message.error("文件不能为空");
			return;
		}

		const file_type = file.type;
		const file_size = file.size;
		const chunkSize = file_type.startsWith("video") ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
		const isSingle = file_size <= chunkSize;

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

			if (response.code === 200 || response.code === 201) {
				onSuccess?.(null, file);
				onUpload?.();
			} else {
				throw new Error(response.message);
			}
		} catch (error: any) {
			onError?.(error);
			message.error("上传失败");
		}
	};

	// 处理文件变化
	const handleChange = ({ fileList }: UploadChangeParam<UploadFile<ResUploadFile>>) => {
		// 更新显示的文件列表
		setFileList(fileList);
	};

	return (
		<div className={styles.container}>
			{/* 拖拽上传区域 */}
			<div className={styles.draggerWrapper}>
				<Dragger
					name="file"
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
						<UploadOutlined />
					</p>
					<p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
				</Dragger>
			</div>

			{/* 显示文件上传列表，包含图片预览 */}
			<div className={styles.fileListWrapper}>
				<Upload
					listType="picture"
					fileList={fileList}
					onChange={handleChange}
					customRequest={customRequest}
					showUploadList={{ showRemoveIcon: true }}
				>
					<Button icon={<UploadOutlined />}>点击上传</Button>
				</Upload>

				{fileList.length === 0 && (
					<div className={styles.emptyWrapper}>
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</div>
				)}
			</div>
		</div>
	);
};

export default FileUpload;
