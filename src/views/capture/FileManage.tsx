import { FileMeta } from "@/api/interface";
import {
	deleteFile,
	downloadMultipleFiles,
	DownloadProgress,
	getFileList,
	renameFile
} from "@/api/modules/file";
import DownloadList from "@/components/DownloadList";
import FileFilter from "@/components/FileFilter";
import FileUpload from "@/components/FileUpload";
import { MIMETypeValue } from "@/constants";
import { concurrencyQueue, formatSize, getFileTypeColor } from "@/utils";
import { DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import {
	Button,
	Flex,
	Image,
	Input,
	message,
	Modal,
	Popconfirm,
	Splitter,
	Table,
	TableColumnsType,
	Tabs,
	TabsProps,
	Tag,
	Tooltip
} from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./FileManage.module.scss";

export type FileManageProps = {};
export type FilterParams = {
	fileType?: string[][];
	fileName?: string;
	createdDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	updatedDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null | null] | null;
	page: number;
	pageSize: number;
};

const FileManage: React.FC<FileManageProps> = () => {
	const [files, setFiles] = useState<FileMeta[]>([]);
	const [downloadList, setDownloadList] = useState<FileMeta[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
	const [activeKey, setActiveKey] = useState("1");
	const [progress, setProgress] = useState<DownloadProgress>({});
	const [compressMode, setCompressMode] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 10,
		total: 0
	});
	const [currentFile, setCurrentFile] = useState<FileMeta | null>(null);
	const [newFileName, setNewFileName] = useState("");

	// 查询文件列表
	const handleSearch = async (params: FilterParams) => {
		try {
			setLoading(true);
			const dateRange = {
				createdStart: params.createdDateRange
					? dayjs(params.createdDateRange[0]).format()
					: undefined,
				createdEnd: params.createdDateRange
					? dayjs(params.createdDateRange[1]).format()
					: undefined,
				updatedStart: params.updatedDateRange
					? dayjs(params.updatedDateRange[0]).format()
					: undefined,
				updatedEnd: params.updatedDateRange ? dayjs(params.updatedDateRange[1]).format() : undefined
			};
			const file_type = params.fileType
				? params.fileType.map(types => types[types.length - 1])
				: [];
			const res = await getFileList({
				page: params.page,
				pageSize: params.pageSize,
				original_file_name: params.fileName,
				file_type: file_type as MIMETypeValue[],
				...dateRange
			});
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setFiles(res.data.list);
			setPagination(prev => ({
				...prev,
				total: res.data ? res.data.pagination.total : 0
			}));
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		handleSearch(pagination);
	}, []);

	const handleFileSelect = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys as number[]);
	};

	const handleRename = (file: FileMeta) => {
		setCurrentFile(file);
		setNewFileName(file.original_file_name);
	};

	const handleDelete = async (fileId: number) => {
		try {
			await deleteFile(fileId);
			message.success("文件删除成功");
			handleSearch({ page: 1, pageSize: 10 });
		} catch (error) {
			message.error("删除文件失败");
		}
	};

	const handleFileRename = async () => {
		if (!newFileName.trim()) {
			message.error("文件名不能为空");
			return;
		}
		if (currentFile) {
			try {
				await renameFile(currentFile.id, newFileName);
				message.success("文件名更新成功");
				handleSearch(pagination);
			} catch (error) {
				message.error("重命名失败");
			} finally {
				setCurrentFile(null);
				setNewFileName("");
			}
		}
	};

	// 批量下载
	const handleBatchDownload = async () => {
		if (selectedRowKeys.length === 0) {
			message.error("请选择至少一个文件进行下载");
			return;
		}

		try {
			setActiveKey("3");
			setDownloadLoading(true);
			if (compressMode) {
				const id = new Date().getTime();
				setDownloadList(prev => [
					...prev,
					{
						id,
						original_file_name: `压缩文件-${dayjs().format("YYYY-MM-DD")}.zip`,
						storage_file_name: "压缩文件.zip",
						file_path: "",
						file_type: "application/zip",
						file_size: selectedRowKeys.reduce(
							(total, fileId) => total + (files.find(file => file.id === fileId)?.file_size || 0),
							0
						),
						file_md5: "",
						creator_id: 0,
						createdAt: dayjs().format(),
						updatedAt: dayjs().format(),
						temp_link: "",
						version: 0
					}
				]);
				await downloadMultipleFiles(selectedRowKeys, {
					onOverallProgress(completed, total) {
						setProgress(prevProgress => ({
							...prevProgress,
							[id]: Math.round((completed / total) * 100)
						}));
					},
					createLink: true,
					compressMode
				});
			} else {
				setDownloadList(files.filter(file => selectedRowKeys.includes(file.id)));
				await downloadMultipleFiles(selectedRowKeys, {
					onProgress: (fileId, progressValue) => {
						setProgress(prevProgress => ({
							...prevProgress,
							[fileId]: progressValue
						}));
					},
					createLink: true,
					concurrency: 3
				});
			}

			message.success("批量下载成功！");
		} catch (error: any) {
			message.error("文件下载失败！");
		} finally {
			setDownloadLoading(false);
			setSelectedRowKeys([]);
		}
	};

	const handleBatchDelete = async () => {
		if (selectedRowKeys.length === 0) {
			message.error("请选择要删除的文件");
			return;
		}
		try {
			const deletePromises = selectedRowKeys.map(fileId => () => deleteFile(fileId));
			await concurrencyQueue(deletePromises, { concurrency: 3 });

			message.success("文件删除成功");
		} catch (error) {
			message.error("删除文件失败");
		} finally {
			handleSearch(pagination);
			setSelectedRowKeys([]);
		}
	};

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "original_file_name",
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
							maxWidth: "250px",
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
			render: (size: number) => formatSize(size)
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm")
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm")
		},
		{
			title: "操作",
			render: (_: any, record: FileMeta) => (
				<>
					<Button type="link" icon={<EditOutlined />} onClick={() => handleRename(record)}>
						重命名
					</Button>
					<Popconfirm
						title="确认删除?"
						description="删除文件后不可恢复"
						onConfirm={() => handleDelete(record.id)}
						okText="确认"
						cancelText="取消"
					>
						<Button type="link" danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</>
			)
		}
	];

	const items: TabsProps["items"] = [
		{
			key: "1",
			label: "数据筛选",
			children: (
				<FileFilter
					onSearch={values => {
						handleSearch({ ...values, page: 1, pageSize: 10 });
					}}
					onReset={() =>
						handleSearch({
							page: 1,
							pageSize: 10
						})
					}
				/>
			)
		},
		{
			key: "2",
			label: "数据上传",
			children: <FileUpload onUpload={() => handleSearch({ page: 1, pageSize: 10 })} />
		},
		{
			key: "3",
			label: "下载列表",
			children: (
				<DownloadList
					progress={progress}
					downloadList={downloadList}
					compressMode={compressMode}
					onCheck={setCompressMode}
					onClear={() => {
						setDownloadList([]);
						setProgress({});
					}}
				/>
			)
		}
	];

	const rowSelection: TableRowSelection<FileMeta> = {
		selectedRowKeys,
		onChange: handleFileSelect
	};

	return (
		<div className={styles["container"]}>
			<Splitter className={styles["content"]}>
				<Splitter.Panel
					collapsible
					defaultSize="30%"
					min="25%"
					max="40%"
					className={styles["content__left"]}
				>
					<Tabs
						style={{ padding: 16 }}
						defaultActiveKey="1"
						activeKey={activeKey}
						onChange={setActiveKey}
						items={items}
					/>
				</Splitter.Panel>
				<Splitter.Panel className={styles["content__right"]}>
					<Flex className={styles["header"]} align="center" gap={16}>
						<Popconfirm
							title="确认下载"
							icon={<DownloadOutlined style={{ color: "green" }} />}
							description="点击确认后将自动开启下载。"
							onConfirm={handleBatchDownload}
							okText="确认"
							cancelText="取消"
						>
							<Button type="primary" loading={downloadLoading}>
								批量下载
							</Button>
						</Popconfirm>
						<Popconfirm
							title="确认删除"
							icon={<DeleteOutlined style={{ color: "red" }} />}
							description="批量删除之后无法恢复。"
							onConfirm={handleBatchDelete}
							okText="确认"
							cancelText="取消"
						>
							<Button type="primary" danger>
								批量删除
							</Button>
						</Popconfirm>
					</Flex>
					<div className={styles["main"]}>
						<Table
							rowSelection={rowSelection}
							columns={columns}
							dataSource={files}
							rowKey="id"
							loading={loading}
							pagination={{
								current: pagination.page,
								pageSize: pagination.pageSize,
								total: pagination.total,
								onChange: (page, pageSize) => setPagination({ ...pagination, page, pageSize })
							}}
						/>
					</div>
				</Splitter.Panel>
			</Splitter>
			<Modal
				title="重命名文件"
				open={!!currentFile}
				onOk={handleFileRename}
				onCancel={() => setCurrentFile(null)}
			>
				<Input
					value={newFileName}
					onChange={e => setNewFileName(e.target.value)}
					placeholder="输入新的文件名"
				/>
			</Modal>
		</div>
	);
};

export default FileManage;
