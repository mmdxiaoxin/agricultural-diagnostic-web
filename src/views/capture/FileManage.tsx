import { FileMeta } from "@/api/interface";
import {
	deleteFile,
	deleteFiles,
	downloadMultipleFiles,
	DownloadProgress,
	getFileList,
	updateFile,
	updateFilesAccess
} from "@/api/modules/file";
import DownloadList from "@/components/List/DownloadList";
import FileAccess from "@/components/FileAccess";
import FileFilter from "@/components/FileFilter";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/Table/FilePreview";
import FileTypeTag from "@/components/Table/FileTypeTag";
import { MIMETypeValue } from "@/constants";
import { formatSize } from "@/utils";
import { DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import {
	Badge,
	Button,
	Dropdown,
	Flex,
	Input,
	MenuProps,
	message,
	Modal,
	Popconfirm,
	Splitter,
	Table,
	TableColumnsType,
	Tabs,
	TabsProps
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
};

const FileManage: React.FC<FileManageProps> = () => {
	const [fileList, setFileList] = useState<FileMeta[]>([]);
	const [downloadList, setDownloadList] = useState<FileMeta[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
	const [activeKey, setActiveKey] = useState("1");
	const [progress, setProgress] = useState<DownloadProgress>({});
	const [compressMode, setCompressMode] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [filterParams, setFilterParams] = useState<FilterParams>({
		fileType: [],
		fileName: "",
		createdDateRange: null,
		updatedDateRange: null
	});
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 10,
		total: 0
	});
	const [currentFile, setCurrentFile] = useState<FileMeta | null>(null);
	const [newFileName, setNewFileName] = useState("");

	const pendingFilesCount = Object.values(progress).filter(p => p < 100).length;

	// 查询文件列表
	const handleSearch = async (
		params: FilterParams & {
			page: number;
			pageSize: number;
		}
	) => {
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
			const fileType = params.fileType ? params.fileType.map(types => types[types.length - 1]) : [];
			const res = await getFileList({
				page: params.page,
				pageSize: params.pageSize,
				originalFileName: params.fileName,
				fileType: fileType.length > 0 ? fileType.join(",") : undefined,
				...dateRange
			});
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setFileList(res.data.list);
			setPagination(prev => ({
				...prev,
				total: res.data ? res.data.total : 0
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
		setNewFileName(file.originalFileName);
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

	const handleFileAccessChange = async (fileId: number, access: string) => {
		try {
			if (!fileId) {
				throw new Error("文件ID不能为空");
			}
			if (fileList.find(file => file.id === fileId)?.access === access) {
				return;
			}
			await updateFile(fileId, { access });
			await handleSearch({ ...filterParams, ...pagination });
			message.success("文件权限更新成功");
		} catch (error) {
			message.error("文件权限更新失败");
		}
	};

	const handleFileRename = async () => {
		if (!newFileName.trim()) {
			message.error("文件名不能为空");
			return;
		}
		if (currentFile) {
			try {
				await updateFile(currentFile.id, { originalFileName: newFileName });
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
						originalFileName: `压缩文件-${dayjs().format("YYYY-MM-DD")}.zip`,
						storageFileName: "压缩文件.zip",
						filePath: "",
						fileType: "application/zip",
						fileSize: selectedRowKeys.reduce(
							(total, fileId) => total + (fileList.find(file => file.id === fileId)?.fileSize || 0),
							0
						),
						fileMd5: "",
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
				setDownloadList(fileList.filter(file => selectedRowKeys.includes(file.id)));
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
			await deleteFiles(selectedRowKeys.join(","));
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
			dataIndex: "originalFileName",
			render: (text: string, record: FileMeta) => <FilePreview meta={record} text={text} />
		},
		{
			title: "文件类型",
			dataIndex: "fileType",
			render: (type: MIMETypeValue) => <FileTypeTag type={type} />
		},
		{
			title: "权限",
			dataIndex: "access",
			render: (access, record) => (
				<FileAccess
					access={access}
					onChange={newAccess => {
						handleFileAccessChange(record.id, newAccess);
					}}
				/>
			)
		},
		{
			title: "大小",
			dataIndex: "fileSize",
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
						setFilterParams(values);
						handleSearch({ ...values, page: 1, pageSize: 10 });
					}}
					onReset={() => {
						setFilterParams({
							fileType: [],
							fileName: "",
							createdDateRange: null,
							updatedDateRange: null
						});
						setPagination({ page: 1, pageSize: 10, total: 0 });
						handleSearch({
							page: 1,
							pageSize: 10
						});
					}}
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
			label: (
				<Badge count={pendingFilesCount}>
					<span>下载列表</span>
				</Badge>
			),
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

	const accessItems: MenuProps["items"] = [
		{
			label: "public",
			key: "1"
		},
		{
			label: "private",
			key: "2"
		}
	];

	const handleBatchAccessChange: MenuProps["onClick"] = async ({ key }) => {
		const access = key === "1" ? "public" : "private";

		try {
			if (selectedRowKeys.length === 0) {
				message.error("请选择至少一个文件进行操作");
				return;
			}
			await updateFilesAccess(selectedRowKeys, access);
			await handleSearch({ ...filterParams, ...pagination });

			message.success("文件权限更新成功");
		} catch (error: any) {
			message.error("文件权限更新失败: " + error.message);
		}
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
						centered
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
						<Dropdown
							menu={{ items: accessItems, onClick: handleBatchAccessChange }}
							trigger={["click"]}
						>
							<Button type="primary">修改权限</Button>
						</Dropdown>
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
							dataSource={fileList}
							rowKey="id"
							loading={loading}
							pagination={{
								current: pagination.page,
								pageSize: pagination.pageSize,
								total: pagination.total,
								onChange: (page, pageSize) => {
									setPagination({ ...pagination, page, pageSize });
									handleSearch({ ...filterParams, ...pagination, page, pageSize });
								}
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
