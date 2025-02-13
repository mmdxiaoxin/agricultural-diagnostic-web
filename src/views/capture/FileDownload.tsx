import { FileMeta } from "@/api/interface";
import { downloadMultipleFiles, DownloadProgress, getFileList } from "@/api/modules/file";
import { MIME_TYPE, MIMETypeValue } from "@/constants/mimeType";
import { formatSize, getFileTypeColor } from "@/utils";
import {
	Button,
	Card,
	Cascader,
	Col,
	DatePicker,
	Image,
	Input,
	message,
	Progress,
	Row,
	Table,
	TableColumnsType,
	Tag,
	Tooltip
} from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./FileDownload.module.scss";

type FileDownloadProps = {};
type FilterParams = {
	fileType: string[][];
	fileName: string;
	createdDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	updatedDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null | null] | null;
	page: number;
	pageSize: number;
	total: number;
};

// 级联选项数据结构
const fileTypeOptions = Object.keys(MIME_TYPE).map(category => {
	const types = MIME_TYPE[category as keyof typeof MIME_TYPE];
	return {
		value: category,
		label: category,
		children: Object.keys(types).map(type => ({
			value: types[type as keyof typeof types],
			label: type
		}))
	};
});

const FileDownload: React.FC<FileDownloadProps> = () => {
	const [progress, setProgress] = useState<DownloadProgress>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [files, setFiles] = useState<FileMeta[]>([]);
	const [filters, setFilters] = useState<FilterParams>({
		fileType: [],
		fileName: "",
		createdDateRange: null,
		updatedDateRange: null,
		page: 1,
		pageSize: 10,
		total: 0
	});
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

	const handleSelect = (selectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(selectedRowKeys as number[]);
	};

	// 文件名筛选处理
	const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters(prev => ({ ...prev, fileName: e.target.value }));
	};

	// 日期范围筛选处理
	const handleDateRangeChange = (
		field: string,
		dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
	) => {
		setFilters(prev => ({ ...prev, [field]: dates }));
	};

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
			const file_type = params.fileType.map(types => types[types.length - 1]);
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
			setFilters(prev => ({
				...prev,
				total: res.data ? res.data.pagination.total : 0
			}));
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleBatchDownload = async () => {
		if (selectedRowKeys.length === 0) {
			message.error("请选择至少一个文件进行下载");
			return;
		}

		try {
			await downloadMultipleFiles(selectedRowKeys, {
				onProgress: (fileId, progressValue) => {
					setProgress(prevProgress => ({
						...prevProgress,
						[fileId]: progressValue
					}));
				},
				createLink: true
			});
		} catch (error: any) {
			message.error("文件下载失败！");
		}

		setProgress({});
		message.success("文件下载成功！");
	};

	useEffect(() => {
		handleSearch(filters);
	}, []);

	const rowSelection: TableRowSelection<FileMeta> = {
		selectedRowKeys,
		onChange: handleSelect
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
					{progress[record.id] > 0 && <Progress percent={progress[record.id] || 0} size="small" />}
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
			render: (type: MIMETypeValue) => <Tag color={getFileTypeColor(type)}>{type}</Tag>
		},
		{
			title: "大小",
			dataIndex: "file_size",
			key: "file_size",
			render: (size: number) => formatSize(size)
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (updatedAt: string) => dayjs(updatedAt).format("YYYY-MM-DD HH:mm")
		}
	];

	return (
		<Row gutter={16} className={styles["container"]}>
			{/* 左侧筛选区域 */}
			<Col span={6} className={styles["download-l"]}>
				<Card title="文件筛选" className={styles["filter-card"]}>
					<Input
						placeholder="文件名"
						value={filters.fileName}
						onChange={handleFileNameChange}
						style={{ marginBottom: 16 }}
					/>
					<Cascader
						options={fileTypeOptions}
						multiple
						placeholder="选择文件类型"
						value={filters.fileType}
						onChange={(value: string[][]) => {
							setFilters(prev => ({ ...prev, fileType: value }));
						}}
						style={{ width: "100%", marginBottom: 16 }}
					/>
					<DatePicker.RangePicker
						value={filters.createdDateRange}
						onChange={dates => handleDateRangeChange("createdDateRange", dates)}
						style={{ width: "100%", marginBottom: 16 }}
						placeholder={["创建时间起", "创建时间止"]}
					/>
					<DatePicker.RangePicker
						value={filters.updatedDateRange}
						onChange={dates => handleDateRangeChange("updatedDateRange", dates)}
						style={{ width: "100%" }}
						placeholder={["更新时间起", "更新时间止"]}
					/>
					<Button
						type="primary"
						onClick={() => handleSearch(filters)}
						style={{ width: "100%", marginTop: 16 }}
					>
						搜索
					</Button>
					<Button
						onClick={() => {
							setFilters(prev => ({
								...prev,
								page: 1,
								pageSize: 10,
								fileType: [],
								fileName: "",
								createdDateRange: null,
								updatedDateRange: null
							}));
							handleSearch({
								...filters,
								page: 1,
								pageSize: 10,
								fileType: [],
								fileName: "",
								createdDateRange: null,
								updatedDateRange: null
							});
						}}
						style={{ width: "100%", marginTop: 16 }}
					>
						重置
					</Button>
				</Card>
			</Col>

			{/* 右侧表格区域 */}
			<Col span={18} className={styles["download-r"]}>
				<Card
					title="文件列表"
					className={styles["table-card"]}
					extra={
						<Button type="primary" onClick={handleBatchDownload} loading={loading}>
							批量下载
						</Button>
					}
				>
					<Table<FileMeta>
						loading={loading}
						columns={columns}
						rowSelection={rowSelection}
						dataSource={files}
						rowKey="id"
						pagination={{
							current: filters.page,
							pageSize: filters.pageSize,
							total: filters.total,
							showQuickJumper: true,
							showSizeChanger: true,
							onChange: (page, pageSize) => {
								setFilters(prev => ({ ...prev, page, pageSize }));
								handleSearch({ ...filters, page, pageSize });
							},
							showTotal: total => `共 ${total} 条`
						}}
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default FileDownload;
