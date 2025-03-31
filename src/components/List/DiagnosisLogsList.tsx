import { DiagnosisLog } from "@/api/interface";
import { getDiagnosisLogList } from "@/api/modules";
import { List, Spin, Typography, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { LogLevel } from "@/enums/log.enum";
import dayjs from "dayjs";
import {
	BugOutlined,
	InfoCircleOutlined,
	WarningOutlined,
	ExclamationCircleOutlined
} from "@ant-design/icons";

const { Text } = Typography;

const LOG_LEVEL_COLOR = {
	[LogLevel.DEBUG]: "default",
	[LogLevel.INFO]: "blue",
	[LogLevel.WARN]: "orange",
	[LogLevel.ERROR]: "red"
};

const LOG_LEVEL_ICON = {
	[LogLevel.DEBUG]: <BugOutlined />,
	[LogLevel.INFO]: <InfoCircleOutlined />,
	[LogLevel.WARN]: <WarningOutlined />,
	[LogLevel.ERROR]: <ExclamationCircleOutlined />
};

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
			className="diagnosis-logs-list"
			bordered
			dataSource={logs}
			renderItem={log => (
				<List.Item className="!px-4 !py-3">
					<div className="flex items-start gap-3 w-full">
						<Tag
							color={LOG_LEVEL_COLOR[log.level]}
							icon={LOG_LEVEL_ICON[log.level]}
							className="!m-0"
						>
							{log.level.toUpperCase()}
						</Tag>
						<div className="flex-1 min-w-0">
							<Text className="block text-sm">{log.message}</Text>
							<Text type="secondary" className="text-xs mt-1 block">
								{dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
							</Text>
						</div>
					</div>
				</List.Item>
			)}
		/>
	);
};

export default DiagnosisLogsList;
