import { FileMeta, ResUploadFile } from "@/api/interface";
import { getFileList, uploadFile } from "@/api/modules/file";
import { formatSize } from "@/utils";
import { UploadOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Empty,
	message,
	Row,
	Table,
	TableColumnsType,
	Tooltip,
	Upload
} from "antd";
import type { RcFile, UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import moment from "moment";
import React, { useEffect, useState } from "react";
import styles from "./FileUpload.module.scss";

type FileUploadProps = {};

const FileUpload: React.FC<FileUploadProps> = () => {
	const { Dragger } = Upload;

	const [loading, setLoading] = useState<boolean>(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [recordList, setRecordList] = useState<FileMeta[]>([]);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 7, total: 0 });

	const fetchRecordList = async (page: number, pageSize: number) => {
		try {
			setLoading(true);
			const params = {
				page,
				pageSize
			};
			const res = await getFileList({ ...params });
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setRecordList(res.data.list);
			setPagination(res.data.pagination);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRecordList(pagination.page, pagination.pageSize);
	}, []);

	// 自定义文件上传处理
	const customRequest: UploadProps<ResUploadFile>["customRequest"] = async options => {
		const { onSuccess, onError, file } = options;

		if (!file) {
			message.error("文件不能为空");
			return;
		}

		try {
			// 调用接口上传文件
			const response = await uploadFile(file as File);

			if (response.code === 200 && response.data) {
				onSuccess?.(response.data, file);
				message.success("文件上传成功！😀");
				fetchRecordList(pagination.page, pagination.pageSize);
			} else {
				throw new Error(response.message);
			}
		} catch (error: any) {
			onError?.(error);
			message.error("上传失败");
		}
	};

	// 图片类型校验
	const beforeUpload = (file: RcFile) => {
		const isImage = file.type.startsWith("image/") || file.type.startsWith("video/");
		if (!isImage) {
			message.error("只能上传图片以及视频文件!");
			return Upload.LIST_IGNORE;
		}
		return isImage;
	};

	// 处理文件变化
	const handleChange = (info: UploadChangeParam) => {
		let fileList = [...info.fileList];

		// 更新显示的文件列表
		setFileList(fileList);
	};

	const handleSelect = (id: number) => {
		console.log("select file id: ", id);
	};

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "original_file_name",
			key: "original_file_name",
			render: (text: string, record: FileMeta) => (
				<Tooltip title={text}>
					<Button
						type="link"
						onClick={() => handleSelect(record.id)}
						style={{
							padding: 0,
							height: "auto",
							maxWidth: "240px",
							display: "inline-block",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis"
						}}
					>
						{text}
					</Button>
				</Tooltip>
			)
		},
		{
			title: "文件类型",
			dataIndex: "file_type",
			key: "file_type"
		},
		{
			title: "大小",
			dataIndex: "file_size",
			key: "file_size",
			render: (size: number) => formatSize(size)
		},
		{
			title: "最后更新",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: (updatedAt: string) => moment(updatedAt).format("YYYY-MM-DD HH:mm")
		}
	];

	return (
		<Row className={styles["container"]}>
			<Col className={styles["upload-l"]} span={7}>
				{/* 拖拽上传区域 */}
				<div className={styles["dragger"]}>
					<Dragger
						name="file"
						customRequest={customRequest}
						onChange={handleChange}
						fileList={fileList}
						beforeUpload={beforeUpload}
						showUploadList={false}
						style={{
							maxHeight: "200px"
						}}
					>
						<p className="ant-upload-drag-icon">
							<UploadOutlined />
						</p>
						<p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
					</Dragger>
				</div>

				{/* 显示文件上传列表，包含图片预览 */}
				<div className={styles["list"]}>
					<Upload
						listType="picture"
						fileList={fileList}
						onChange={handleChange}
						customRequest={customRequest}
						beforeUpload={beforeUpload}
						showUploadList={{ showRemoveIcon: true }}
					>
						<Button icon={<UploadOutlined />}>点击上传</Button>
					</Upload>
					{fileList.length === 0 && (
						<div className={styles["empty"]}>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					)}
				</div>
			</Col>
			<Col className={styles["upload-r"]} span={17}>
				<Card title="历史上传" className={styles["file-card"]}>
					<Table<FileMeta>
						loading={loading}
						columns={columns}
						dataSource={recordList}
						pagination={{
							current: pagination.page,
							pageSize: pagination.pageSize,
							total: pagination.total,
							onChange(page, pageSize) {
								setPagination({ ...pagination, page, pageSize });
								fetchRecordList(page, pageSize);
							}
						}}
						rowKey="id"
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default FileUpload;
