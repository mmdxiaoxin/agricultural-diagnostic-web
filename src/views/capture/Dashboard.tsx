import { DiskUsageReport, FileMeta } from "@/api/interface";
import { getDiskUsage, getFileList } from "@/api/modules/file";
import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileCard from "@/components/FileCard";
import FilePreview from "@/components/Table/FilePreview";
import { MIMETypeValue } from "@/constants/mimeType";
import { formatSize, getFileType, getFileTypeColor } from "@/utils";
import { Button, Card, Col, message, Row, Table, TableColumnsType, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.scss";

const totalSpace = 1_000_000_000; // 1GB

const Dashboard: React.FC = () => {
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

	const initialize = async () => {
		try {
			const [diskResp, listResp] = await Promise.all([
				getDiskUsage(),
				getFileList({ page: 1, pageSize: 10 })
			]);

			if (diskResp.code !== 200 || !diskResp.data) {
				throw new Error(diskResp.message);
			}

			if (listResp.code !== 200 || !listResp.data) {
				throw new Error(listResp.message);
			}

			setDiskReport(diskResp.data);
			setTotalUsage(parseInt(diskResp.data.total.used || "0"));
			setFileList(listResp.data.list);
			setPagination({
				page: listResp.data.page ?? 1,
				pageSize: listResp.data.pageSize ?? 10,
				total: listResp.data.total ?? 0
			});
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleSelect = (type?: string) => {
		setSelectedType(type);
		handleSearch(1, pagination.pageSize, type);
	};

	const handleSearch = async (page: number, pageSize: number, selectedType?: string) => {
		try {
			setLoading(true);
			const fileType = getFileType(selectedType!);
			const params = {
				page,
				pageSize,
				fileType: fileType.length > 0 ? fileType.join(",") : undefined
			};
			const response = await getFileList(params);
			if (response.code !== 200 || !response.data) {
				throw new Error(response.message);
			}
			setFileList(response.data.list);
			setPagination({
				page: response.data.page ?? 1,
				pageSize: response.data.pageSize ?? 10,
				total: response.data.total ?? 0
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		initialize();
	}, []);

	const fileCardStyle = (type: string): CSSProperties => ({
		border: selectedType === type ? "1px solid #1890ff" : "",
		borderRadius: "20px",
		boxSizing: "border-box"
	});

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "originalFileName",
			key: "originalFileName",
			render: (text: string, record: FileMeta) => <FilePreview meta={record} text={text} />
		},
		{
			title: "文件类型",
			dataIndex: "fileType",
			key: "fileType",
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
			dataIndex: "fileSize",
			key: "fileSize",
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
							onClick={() => handleSelect("application")}
							style={fileCardStyle("application")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.image}
							type="图片"
							icon="FileImageOutlined"
							color="#4892ff"
							onClick={() => handleSelect("image")}
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
							onClick={() => handleSelect("video")}
							style={fileCardStyle("video")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.audio}
							type="音频"
							icon="FileZipOutlined"
							onClick={() => handleSelect("audio")}
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
							onClick={() => handleSelect("app")}
							style={fileCardStyle("app")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							info={diskReport?.other}
							type="其他"
							color="#ffaa00"
							icon="FileZipOutlined"
							onClick={() => handleSelect("other")}
							style={fileCardStyle("other")}
						/>
					</Col>
				</Row>
			</Col>
			<Col span={12} className={styles["dashboard-r"]}>
				<Card
					title="文件列表"
					className={styles["table-card"]}
					extra={<Button onClick={() => handleSelect(undefined)}>重置</Button>}
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
								handleSearch(page, pageSize, selectedType);
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
