import { DiskUsageReport, FileMeta } from "@/api/interface";
import { getDiskUsage, getFileList } from "@/api/modules/file";
import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileCard from "@/components/FileCard";
import { MIMETypeValue } from "@/constants/mimeType";
import { formatSize, getFileType, getFileTypeColor } from "@/utils";
import {
	Button,
	Card,
	Col,
	Image,
	message,
	Row,
	Table,
	TableColumnsType,
	Tag,
	Tooltip
} from "antd";
import dayjs from "dayjs";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.scss";

const totalSpace = 1_000_000_000; // 1GB

const Dashboard = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [totalUsage, setTotalUsage] = useState<number>(0);
	const [diskReport, setDiskReport] = useState<DiskUsageReport>();
	const formattedUsedSpace = useMemo<string>(
		() => formatSize(parseInt(diskReport?.total.used || "0")),
		[diskReport?.total]
	);
	const formattedTotalSpace = formatSize(totalSpace);

	// 文件类型筛选
	const [selectedType, setSelectedType] = useState<string>();

	// 分页数据
	const [fileList, setFileList] = useState<FileMeta[]>([]);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

	const fetchDiskReport = async () => {
		try {
			setLoading(true);
			const res = await getDiskUsage();
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setDiskReport(res.data);
			setTotalUsage(parseInt(res.data.total.used || "0"));
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDiskReport();
	}, []);

	const fetchFileList = async (page: number, pageSize: number, selectedType?: string) => {
		try {
			setLoading(true);
			const file_type = getFileType(selectedType!);
			const params = {
				page,
				pageSize,
				file_type: file_type.length ? file_type : undefined
			};
			const res = await getFileList(params);
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setFileList(res.data.list);
			setPagination(res.data.pagination);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const fileCardStyle = (type: string): CSSProperties => ({
		border: selectedType === type ? "1px solid #1890ff" : "",
		borderRadius: "20px",
		boxSizing: "border-box"
	});

	const handleSelect = (file: FileMeta) => {
		if (file.file_type.startsWith("image")) {
			window.open(file.temp_link);
		}
	};

	useEffect(() => {
		fetchFileList(pagination.page, pagination.pageSize, selectedType);
	}, [selectedType]);

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
							maxWidth: "200px",
							display: "inline-block",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis"
						}}
						onClick={() => handleSelect(record)}
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
			title: "最后更新",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: (updatedAt: string) => dayjs(updatedAt).format("YYYY-MM-DD HH:mm")
		}
	];

	return (
		<Row className={styles["container"]} gutter={10}>
			<Col span={12} className={styles["dashboard-l"]}>
				<Row className={styles["dashboard-row"]}>
					<Col span={24}>
						<Card className={styles["disk-card"]}>
							<div className={styles["disk-box"]}>
								<div className={styles["disk-info"]}>
									<div className={styles["title"]}>空间使用情况</div>
									<div className={styles["subtitle"]}>
										{`已用 ${formattedUsedSpace} / 总空间 ${formattedTotalSpace}`}
									</div>
								</div>
								<div className={styles["disk-chart"]}>
									<DiskSpaceUsageChart usedSpace={totalUsage} />
								</div>
							</div>
						</Card>
					</Col>
				</Row>
				<Row className={styles["dashboard-row"]} gutter={16}>
					<Col span={12}>
						<FileCard
							info={diskReport?.application}
							type="文档"
							color="#ff4848"
							onClick={() => setSelectedType("application")}
							style={fileCardStyle("application")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.image}
							type="图片"
							icon="FileImageOutlined"
							color="#4892ff"
							onClick={() => setSelectedType("image")}
							style={fileCardStyle("image")}
						/>
					</Col>
				</Row>
				<Row className={styles["dashboard-row"]} gutter={16}>
					<Col span={12}>
						<FileCard
							info={diskReport?.video}
							type="视频"
							color="#aa48ff"
							icon="VideoCameraOutlined"
							onClick={() => setSelectedType("video")}
							style={fileCardStyle("video")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.audio}
							type="音频"
							icon="FileZipOutlined"
							onClick={() => setSelectedType("audio")}
							style={fileCardStyle("audio")}
						/>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<FileCard
							info={diskReport?.app}
							type="压缩包"
							color="#ccc200"
							icon="FileZipOutlined"
							onClick={() => setSelectedType("app")}
							style={fileCardStyle("app")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.other}
							type="其他"
							color="#ffaa00"
							icon="FileZipOutlined"
							onClick={() => setSelectedType("other")}
							style={fileCardStyle("other")}
						/>
					</Col>
				</Row>
			</Col>
			<Col span={12} className={styles["dashboard-r"]}>
				<Card
					title="文件列表"
					className={styles["table-card"]}
					extra={<Button onClick={() => setSelectedType(undefined)}>重置</Button>}
				>
					<Table<FileMeta>
						loading={loading}
						columns={columns}
						dataSource={fileList}
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
								fetchFileList(page, pageSize, selectedType);
							}
						}}
						rowKey="id"
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default Dashboard;
