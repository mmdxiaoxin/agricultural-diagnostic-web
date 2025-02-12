import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileCard from "@/components/FileCard";
import { formatSize } from "@/utils";
import { Card, Col, Row, Table, Pagination, Button } from "antd";
import { useState, useMemo } from "react";
import styles from "./Dashboard.module.scss";

const totalSpace = 1_000_000_000; // 1GB

// 模拟文件数据
const fileData = [
	{
		id: 1,
		file_name: "file1.jpg",
		file_size: 42667,
		file_type: "image/jpeg",
		lastUpdated: "2025-02-11T15:28:36.000Z"
	},
	{
		id: 2,
		file_name: "file2.mp4",
		file_size: 987654321,
		file_type: "video/mp4",
		lastUpdated: "2025-01-01T12:11:36.000Z"
	},
	{
		id: 3,
		file_name: "file3.pdf",
		file_size: 523456,
		file_type: "application/pdf",
		lastUpdated: "2024-12-20T10:11:20.000Z"
	},
	{
		id: 4,
		file_name: "file4.mp3",
		file_size: 334556789,
		file_type: "audio/mp3",
		lastUpdated: "2024-11-15T09:23:55.000Z"
	}
	// 更多数据...
];

const Dashboard = () => {
	const [usedSpace, setUsedSpace] = useState<number>(704120000);
	const formattedUsedSpace = useMemo<string>(() => formatSize(usedSpace), [usedSpace]);
	const formattedTotalSpace = formatSize(totalSpace);

	// 文件类型筛选
	const [fileType, setFileType] = useState<string | null>(null);

	// 文件筛选后的数据
	const filteredFiles = fileData.filter(file => !fileType || file.file_type.includes(fileType));

	// 每页显示的文件数量
	const pageSize = 5;

	// 处理分页
	const [currentPage, setCurrentPage] = useState(1);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const columns = [
		{
			title: "文件名",
			dataIndex: "file_name",
			key: "file_name"
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
			dataIndex: "lastUpdated",
			key: "lastUpdated"
		}
	];

	const pagedData = filteredFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	return (
		<Row className={styles["dashboard"]}>
			<Col span={12} className={styles["dashboard-l"]}>
				<Row>
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
									<DiskSpaceUsageChart usedSpace={usedSpace} />
								</div>
							</div>
						</Card>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<FileCard
							type="文件"
							size={111234124}
							lastUpdated="2024.11.17 19:11"
							onClick={() => setFileType("image")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							type="图片"
							size={12345245}
							lastUpdated="2022.12.17 21:11"
							onClick={() => setFileType("image")}
						/>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<FileCard
							type="视频、音频"
							size={43536}
							lastUpdated="2024.7.17 11:11"
							onClick={() => setFileType("audio")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							type="其他"
							size={98586}
							lastUpdated="2024.2.17 11:11"
							onClick={() => setFileType("application/pdf")}
						/>
					</Col>
				</Row>
			</Col>
			<Col span={12} className={styles["dashboard-r"]}>
				<Card title="文件列表" extra={<Button onClick={() => setFileType(null)}>重置</Button>}>
					<Table columns={columns} dataSource={pagedData} pagination={false} rowKey="id" />
					<Pagination
						current={currentPage}
						pageSize={pageSize}
						total={filteredFiles.length}
						onChange={handlePageChange}
						style={{ marginTop: 16 }}
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default Dashboard;
