import { FileMeta } from "@/api/interface";
import { deleteFile, getFileList, renameFile } from "@/api/modules/file";
import { MIMETypeValue } from "@/constants";
import { formatSize, getFileTypeColor } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Flex,
	Input,
	List,
	message,
	Modal,
	Splitter,
	Table,
	TableColumnsType,
	Tag,
	Tooltip
} from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./FileManage.module.scss";

export type FileManageProps = {};

const FileManage: React.FC<FileManageProps> = () => {
	const [files, setFiles] = useState<FileMeta[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [filters, setFilters] = useState({
		fileName: "",
		fileType: [],
		createdDateRange: null,
		page: 1,
		pageSize: 10,
		total: 0
	});
	const [currentFile, setCurrentFile] = useState<FileMeta | null>(null);
	const [newFileName, setNewFileName] = useState("");

	const fetchFileList = async () => {
		setLoading(true);
		try {
			const response = await getFileList(filters);
			if (response.code !== 200 || !response.data) {
				throw new Error(response.message);
			}
			setFiles(response.data.list);
			setFilters(prev => ({
				...prev,
				total: response.data ? response.data.pagination.total : 0
			}));
		} catch (error) {
			message.error("加载文件列表失败");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFileList();
	}, [filters.page, filters.pageSize]);

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
			fetchFileList();
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
				fetchFileList();
			} catch (error) {
				message.error("重命名失败");
			} finally {
				setCurrentFile(null);
				setNewFileName("");
			}
		}
	};

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "original_file_name",
			render: (text: string, record: FileMeta) => (
				<Tooltip title={text}>
					<Button type="link" onClick={() => handleRename(record)}>
						{text}
					</Button>
				</Tooltip>
			)
		},
		{
			title: "文件类型",
			dataIndex: "file_type",
			render: (type: MIMETypeValue) => <Tag color={getFileTypeColor(type)}>{type}</Tag>
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
					<Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						删除
					</Button>
				</>
			)
		}
	];

	const rowSelection: TableRowSelection<FileMeta> = {
		selectedRowKeys,
		onChange: handleFileSelect
	};

	return (
		<div className={styles["container"]}>
			<Flex className={styles["toolbar"]}>
				<div>工具栏</div>
			</Flex>
			<Splitter className={styles["content"]}>
				<Splitter.Panel
					collapsible
					defaultSize="40%"
					min="20%"
					max="40%"
					className={styles["content-l"]}
				>
					<Card title="数据集管理" className={styles["dataset-card"]}>
						<List
							loading={loading}
							itemLayout="vertical"
							dataSource={files}
							renderItem={file => (
								<List.Item
									key={file.id}
									actions={[
										<Button type="link" icon={<EditOutlined />} onClick={() => handleRename(file)}>
											重命名
										</Button>,
										<Button
											type="link"
											icon={<DeleteOutlined />}
											onClick={() => handleDelete(file.id)}
										>
											删除
										</Button>
									]}
								>
									<List.Item.Meta
										title={file.original_file_name}
										description={dayjs(file.createdAt).format("YYYY-MM-DD HH:mm")}
									/>
									<div>
										<Tag color={getFileTypeColor(file.file_type)}>{file.file_type}</Tag>
										<span>{formatSize(file.file_size)}</span>
									</div>
								</List.Item>
							)}
						/>
					</Card>
				</Splitter.Panel>
				<Splitter.Panel className={styles["content-r"]}>
					<Card title="文件列表" className={styles["file-card"]}>
						<Table
							rowSelection={rowSelection}
							columns={columns}
							dataSource={files}
							rowKey="id"
							loading={loading}
							pagination={{
								current: filters.page,
								pageSize: filters.pageSize,
								total: filters.total,
								onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize })
							}}
						/>
					</Card>
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
