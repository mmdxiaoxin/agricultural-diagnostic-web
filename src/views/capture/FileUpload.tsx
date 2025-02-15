import { FileMeta, ResUploadFile } from "@/api/interface";
import { getFileList, uploadChunksFile, uploadSingleFile } from "@/api/modules/file";
import { MIMETypeValue } from "@/constants";
import { formatSize, getFileTypeColor } from "@/utils";
import { UploadOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Empty,
	Image,
	message,
	Row,
	Table,
	TableColumnsType,
	Tag,
	Tooltip,
	Upload
} from "antd";
import type { UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./FileUpload.module.scss";

type FileUploadProps = {};

const FileUpload: React.FC<FileUploadProps> = () => {
	const { Dragger } = Upload;

	const [loading, setLoading] = useState<boolean>(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [recordList, setRecordList] = useState<FileMeta[]>([]);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

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
	const customRequest: UploadProps<null>["customRequest"] = async options => {
		const { onSuccess, onError, file: RcFile } = options;

		const file = RcFile as File | null;
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
				? await uploadChunksFile(file, { chunkSize })
				: await uploadSingleFile(file);

			if (response.code === 200 || response.code === 201) {
				onSuccess?.(null, file);
				fetchRecordList(pagination.page, pagination.pageSize);
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

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "original_file_name",
			key: "original_file_name",
			render: (text: string, record: FileMeta) => (
				<Tooltip
					title={
						<div>
							{record.file_type.startsWith("image") && <Image src={record.temp_link} />}
							{text}
						</div>
					}
				>
					<Button
						type="link"
						style={{
							padding: 0,
							margin: 0,
							height: "auto",
							maxWidth: "400px",
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
			key: "file_type",
			render: (type: MIMETypeValue) => (
				<Tooltip title={type}>
					<Tag
						color={getFileTypeColor(type)}
						style={{
							maxWidth: "200px",
							display: "inline-block",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis"
						}}
					>
						{type}
					</Tag>
				</Tooltip>
			)
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
			render: (updatedAt: string) => dayjs(updatedAt).format("YYYY-MM-DD HH:mm")
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
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal(total) {
								return `共 ${total} 条`;
							},
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
