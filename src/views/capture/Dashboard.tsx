import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileCard from "@/components/FileCard";
import { formatSize } from "@/utils";
import { Card, Col, Row } from "antd";
import { useMemo, useState } from "react";
import styles from "./Dashboard.module.scss";

const totalSpace = 1_000_000_000; // 1GB

const Dashboard = () => {
	const [usedSpace, setUsedSpace] = useState<number>(10412000);
	const formattedUsedSpace = useMemo<string>(() => formatSize(usedSpace), [usedSpace]);
	const formattedTotalSpace = formatSize(totalSpace);

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
				<Row>
					<Col span={12}>
						<FileCard type="文件" size={111234124} lastUpdated="2024.11.17 19:11" />
					</Col>
					<Col span={12}>
						<FileCard type="图片" size={12345245} lastUpdated="2022.12.17 21:11" />
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<FileCard type="视频、音频" size={43536} lastUpdated="2024.7.17 11:11" />
					</Col>
					<Col span={12}>
						<FileCard type="其他" size={98586} lastUpdated="2024.2.17 11:11" />
					</Col>
				</Row>
			</Col>
			<Col span={12} className={styles["dashboard-r"]}>
				<Card title="文件列表"></Card>
			</Col>
		</Row>
	);
};

export default Dashboard;
