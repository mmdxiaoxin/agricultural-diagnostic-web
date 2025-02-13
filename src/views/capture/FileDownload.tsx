import { FileMeta } from "@/api/interface";
import { getFileList } from "@/api/modules/file";
import { MIMETypeValue } from "@/constants/mimeType";
import { formatSize } from "@/utils";
import {
	Button,
	Card,
	Col,
	DatePicker,
	Image,
	Input,
	message,
	Row,
	Select,
	Table,
	TableColumnsType,
	Tooltip
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./FileDownload.module.scss";

type FileDownloadProps = {};
type FilterParams = {
	file_type: MIMETypeValue[];
	fileName: string;
	createdDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	updatedDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null | null] | null;
	page: number;
	pageSize: number;
	total: number;
};

const FileDownload: React.FC<FileDownloadProps> = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [files, setFiles] = useState<FileMeta[]>([]);
	const [filters, setFilters] = useState<FilterParams>({
		file_type: [],
		fileName: "",
		createdDateRange: null,
		updatedDateRange: null,
		page: 1,
		pageSize: 10,
		total: 0
	});

	const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilters(prev => ({ ...prev, fileName: e.target.value }));
	};

	const handleDateRangeChange = (
		field: string,
		dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
	) => {
		setFilters(prev => ({ ...prev, [field]: dates }));
	};

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
			const res = await getFileList({
				page: params.page,
				pageSize: params.pageSize,
				original_file_name: filters.fileName,
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

	useEffect(() => {
		handleSearch(filters);
	}, []);

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
							height: "auto",
							maxWidth: "200px",
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
					<Select
						mode="multiple"
						placeholder="文件类型"
						value={filters.file_type}
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
				</Card>
			</Col>

			{/* 右侧表格区域 */}
			<Col span={18} className={styles["download-r"]}>
				<Card title="文件列表" className={styles["table-card"]}>
					<Table<FileMeta>
						loading={loading}
						columns={columns}
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
