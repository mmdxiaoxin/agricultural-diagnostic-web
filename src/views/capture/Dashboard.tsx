import { FileMeta } from "@/api/interface";
import { getFileList } from "@/api/modules/file";
import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileCard from "@/components/FileCard";
import { formatSize } from "@/utils";
import { Button, Card, Col, message, Row, Table, TableColumnsType, Tooltip } from "antd";
import moment from "moment";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.scss";

const totalSpace = 1_000_000_000; // 1GB

const Dashboard = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [usedSpace] = useState<number>(704120000); // TODO: 从接口获取已使用空间
	const formattedUsedSpace = useMemo<string>(() => formatSize(usedSpace), [usedSpace]);
	const formattedTotalSpace = formatSize(totalSpace);

	// 文件类型筛选
	const [fileType, setFileType] = useState<string>();

	// 分页数据
	const [fileList, setFileList] = useState<FileMeta[]>([]);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 7, total: 0 });

	const fetchFileList = async (page: number, pageSize: number, fileType?: string) => {
		try {
			setLoading(true);
			const params = {
				page,
				pageSize,
				file_type: fileType
			};
			const res = await getFileList({ ...params });
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
		border: fileType === type ? "1px solid #1890ff" : "",
		borderRadius: "20px",
		boxSizing: "border-box"
	});

	const handleSelectFile = (id: number) => {
		console.log("select file id: ", id);
	};

	useEffect(() => {
		fetchFileList(pagination.page, pagination.pageSize, fileType);
	}, [fileType]);

	const columns: TableColumnsType<FileMeta> = [
		{
			title: "文件名",
			dataIndex: "original_file_name",
			key: "original_file_name",
			render: (text: string, record: FileMeta) => (
				<Tooltip title={text}>
					<Button
						type="link"
						onClick={() => handleSelectFile(record.id)}
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
			render: (updatedAt: string) => moment(updatedAt).format("YYYY-MM-DD HH:mm")
		}
	];

	return (
		<Row className={styles["dashboard"]} gutter={10}>
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
									<DiskSpaceUsageChart usedSpace={usedSpace} />
								</div>
							</div>
						</Card>
					</Col>
				</Row>
				<Row className={styles["dashboard-row"]} gutter={16}>
					<Col span={12}>
						<FileCard
							type="文件"
							color="#ff4848"
							size={111234124}
							lastUpdated="2024.11.17 19:11"
							onClick={() => setFileType("")}
							style={fileCardStyle("")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							type="图片"
							size={12345245}
							lastUpdated="2022.12.17 21:11"
							icon="FileImageOutlined"
							color="#4892ff"
							onClick={() => setFileType("image")}
							style={fileCardStyle("image")}
						/>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<FileCard
							type="视频、音频"
							size={43536}
							color="#aa48ff"
							icon="VideoCameraOutlined"
							lastUpdated="2024.7.17 11:11"
							onClick={() => setFileType("audio")}
							style={fileCardStyle("audio")}
						/>
					</Col>
					<Col span={12}>
						<FileCard
							type="其他"
							size={98586}
							icon="FileZipOutlined"
							lastUpdated="2024.2.17 11:11"
							onClick={() => setFileType("application/pdf")}
							style={fileCardStyle("application/pdf")}
						/>
					</Col>
				</Row>
			</Col>
			<Col span={12} className={styles["dashboard-r"]}>
				<Card
					title="文件列表"
					className={styles["file-card"]}
					extra={<Button onClick={() => setFileType(undefined)}>重置</Button>}
				>
					<Table<FileMeta>
						loading={loading}
						columns={columns}
						dataSource={fileList}
						pagination={{
							current: pagination.page,
							pageSize: pagination.pageSize,
							total: pagination.total,
							onChange(page, pageSize) {
								setPagination({ ...pagination, page, pageSize });
								fetchFileList(page, pageSize, fileType);
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
