import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import { Card, Col, Row } from "antd";
import styles from "./Dashboard.module.scss";
import FileCard from "@/components/FileCard";

const Dashboard = () => {
	return (
		<Row className={styles["dashboard"]}>
			<Col span={12} className={styles["dashboard-l"]}>
				<Row>
					<Col span={24}>
						<Card className={styles.storeCard}>
							<div style={{ height: 250, width: 250 }}>
								<DiskSpaceUsageChart usedSpace={10412000} />
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
