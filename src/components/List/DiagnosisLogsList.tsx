import { DiagnosisLog } from "@/api/interface";
import { getDiagnosisLogList } from "@/api/modules";
import { List, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Text } = Typography;

export type DiagnosisLogsListProps = {
	diagnosisId: number;
};

const DiagnosisLogsList: React.FC<DiagnosisLogsListProps> = ({ diagnosisId }) => {
	const [logs, setLogs] = useState<DiagnosisLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadLogs = async () => {
			setLoading(true);
			try {
				const data = await getDiagnosisLogList(diagnosisId, { page: 1, pageSize: 10 });
				setLogs(data.data?.list || []);
			} catch (error) {
				console.error("加载日志失败", error);
			} finally {
				setLoading(false);
			}
		};

		loadLogs();
	}, [diagnosisId]);

	if (loading) return <Spin />;

	return (
		<List
			header={<div>诊断日志</div>}
			bordered
			dataSource={logs}
			renderItem={log => (
				<List.Item>
					<Text>{log.message}</Text>
					<Text type="secondary">{new Date(log.createdAt).toLocaleString()}</Text>
				</List.Item>
			)}
		/>
	);
};

export default DiagnosisLogsList;
