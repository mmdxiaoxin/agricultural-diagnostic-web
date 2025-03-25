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
import FileManagePanel from "@/components/FileManagePanel";
import RenameFileModal, { RenameFileModalRef } from "@/components/Modal/RenameFileModal";
import FileAccess from "@/components/Table/FileAccess";
import FilePreview from "@/components/Table/FilePreview";
import FileTypeTag from "@/components/Table/FileTypeTag";
import { MIMETypeValue } from "@/constants";
import { formatSize } from "@/utils";
import { DeleteOutlined, DownloadOutlined, EditOutlined, FolderOutlined } from "@ant-design/icons";
import {
	Button,
	Dropdown,
	Flex,
	MenuProps,
	message,
	Popconfirm,
	Space,
	Table,
	TableColumnsType
} from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export type FileManageProps = {};
export type FilterParams = {
	fileType?: string[][];
	fileName?: string;
	createdDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	updatedDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
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
	const renameModalRef = useRef<RenameFileModalRef>(null);

	const navigate = useNavigate();

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
		renameModalRef.current?.open(file.originalFileName);
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

	const handleFileRename = async (newFileName: string) => {
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
				const totalSize = selectedRowKeys.reduce(
					(total, fileId) => total + (fileList.find(file => file.id === fileId)?.fileSize || 0),
					0
				);
				setDownloadList(prev => [
					...prev,
					{
						id,
						originalFileName: `压缩文件-${dayjs().format("YYYY-MM-DD")}.zip`,
						storageFileName: "压缩文件.zip",
						filePath: "",
						fileType: "application/zip",
						fileSize: totalSize,
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

	const handleSingleDownload = async (file: FileMeta) => {
		try {
			setActiveKey("3");
			setDownloadLoading(true);
			setDownloadList(prev => [...prev, file]);
			await downloadMultipleFiles([file.id], {
				onProgress: (fileId, progressValue) => {
					setProgress(prevProgress => ({
						...prevProgress,
						[fileId]: progressValue
					}));
				},
				createLink: true
			});
			message.success("文件下载成功！");
		} catch (error: any) {
			message.error("文件下载失败！");
		} finally {
			setDownloadLoading(false);
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
				<Space>
					<Popconfirm
						title="确认下载"
						icon={<DownloadOutlined style={{ color: "green" }} />}
						description="点击确认后将自动开启下载。"
						onConfirm={() => handleSingleDownload(record)}
						okText="确认"
						cancelText="取消"
					>
						<Button
							type="link"
							icon={<DownloadOutlined />}
							className="text-blue-500 hover:text-blue-600"
						>
							下载
						</Button>
					</Popconfirm>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => handleRename(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						重命名
					</Button>
					<Popconfirm
						title="确认删除?"
						description="删除文件后不可恢复"
						onConfirm={() => handleDelete(record.id)}
						okText="确认"
						cancelText="取消"
					>
						<Button
							type="link"
							danger
							icon={<DeleteOutlined />}
							className="text-red-500 hover:text-red-600"
						>
							删除
						</Button>
					</Popconfirm>
				</Space>
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

	const renderActionButtons = () => {
		switch (activeKey) {
			case "1": // 数据筛选
				return (
					<Flex gap={4}>
						<Dropdown
							menu={{ items: accessItems, onClick: handleBatchAccessChange }}
							trigger={["click"]}
						>
							<Button
								type="primary"
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"bg-green-500 hover:bg-green-600",
									"border-none",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center gap-2"
								)}
							>
								修改权限
							</Button>
						</Dropdown>
						<Popconfirm
							title="确认删除"
							icon={<DeleteOutlined style={{ color: "red" }} />}
							description="批量删除之后无法恢复。"
							onConfirm={handleBatchDelete}
							okText="确认"
							cancelText="取消"
						>
							<Button
								type="primary"
								danger
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"border-none",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center gap-2"
								)}
							>
								批量删除
							</Button>
						</Popconfirm>
					</Flex>
				);
			case "2": // 数据上传
				return null; // 上传组件内部已有按钮
			case "3": // 下载列表
				return (
					<Flex gap={4}>
						<Button
							type="primary"
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
							onClick={handleBatchDownload}
							loading={downloadLoading}
						>
							批量下载
						</Button>
					</Flex>
				);
			default:
				return null;
		}
	};

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<FileManagePanel
				fileList={fileList}
				activeKey={activeKey}
				onActiveKeyChange={setActiveKey}
				filterParams={filterParams}
				onFilterParamsChange={setFilterParams}
				onSearch={handleSearch}
				progress={progress}
				downloadList={downloadList}
				compressMode={compressMode}
				onCompressModeChange={setCompressMode}
				onDownloadListClear={() => {
					setDownloadList([]);
					setProgress({});
				}}
			/>

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
				<div className="flex justify-between items-center mb-6">
					{renderActionButtons()}
					<div className="flex items-center gap-2">
						<Button
							icon={<FolderOutlined />}
							className={clsx(
								"px-4 h-10",
								"rounded-lg",
								"bg-gray-100 hover:bg-gray-200",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
							onClick={() => navigate("/capture/dataset/create")}
						>
							新建数据集
						</Button>
					</div>
				</div>

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
					className={clsx("rounded-lg", "overflow-hidden", "border border-gray-100")}
				/>
			</div>

			<RenameFileModal ref={renameModalRef} onOk={handleFileRename} />
		</div>
	);
};

export default FileManage;
