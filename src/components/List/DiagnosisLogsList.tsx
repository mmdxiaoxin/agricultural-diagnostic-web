import { DiagnosisLog } from "@/api/interface";
import { getDiagnosisLogList } from "@/api/modules";
import { LogLevel } from "@/enums/log.enum";
import {
	BugOutlined,
	ExclamationCircleOutlined,
	InfoCircleOutlined,
	WarningOutlined,
	CheckCircleOutlined,
	PlayCircleOutlined
} from "@ant-design/icons";
import { Button, List, Skeleton, Spin, Tag, Typography, Divider } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

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

// 特殊日志配置
const SPECIAL_LOGS = [
	{
		message: "诊断任务完成",
		icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
		className: "bg-green-50 border-l-4 border-green-500"
	},
	{
		message: "开始诊断任务",
		icon: <PlayCircleOutlined style={{ color: "#1890ff" }} />,
		className: "bg-blue-50 border-l-4 border-blue-500"
	},
	{
		message: "开始诊断失败",
		icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
		className: "bg-red-50 border-l-4 border-red-500"
	}
];

export type DiagnosisLogsListProps = {
	diagnosisId: number;
};

export type DiagnosisLogItem = DiagnosisLog & {
	loading: boolean;
};

const DiagnosisLogsList: React.FC<DiagnosisLogsListProps> = ({ diagnosisId }) => {
	const [logs, setLogs] = useState<DiagnosisLogItem[]>([]);
	const [initLoading, setInitLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const pageSize = 13;

	useEffect(() => {
		loadLogs();
	}, [diagnosisId, page]);

	const loadLogs = async () => {
		setInitLoading(true);
		// 在请求开始前，添加占位符
		const placeholderLogs = Array.from({ length: pageSize }, (_, index) => ({
			id: index,
			diagnosisId: diagnosisId,
			level: LogLevel.INFO,
			message: "加载中...",
			createdAt: new Date().toISOString(),
			metadata: {},
			loading: true
		}));

		setLogs(prevLogs => [...prevLogs, ...placeholderLogs]);

		try {
			const data = await getDiagnosisLogList(diagnosisId, { page, pageSize });
			// 替换占位符为实际数据
			setLogs(prevLogs => {
				const newLogs = data.data?.list || [];
				setTotal(data.data?.total || 0);
				return [
					...prevLogs.slice(0, prevLogs.length - pageSize),
					...newLogs.map(log => ({ ...log, loading: false }))
				];
			});
		} catch (error) {
			console.error("加载日志失败", error);
		} finally {
			setInitLoading(false);
		}
	};

	if (initLoading && page === 1) return <Spin />;

	const loadMore =
		!initLoading && logs.length < total ? (
			<Button onClick={() => setPage(prevPage => prevPage + 1)} style={{ width: "100%" }}>
				加载更多
			</Button>
		) : null;

	const isSpecialLog = (message: string) => {
		return SPECIAL_LOGS.some(log => log.message === message);
	};

	const getSpecialLogConfig = (message: string) => {
		return SPECIAL_LOGS.find(log => log.message === message);
	};

	return (
		<List
			className="diagnosis-logs-list"
			bordered
			dataSource={logs}
			renderItem={log => {
				const specialConfig = isSpecialLog(log.message) ? getSpecialLogConfig(log.message) : null;

				return (
					<>
						<List.Item className={`!px-4 !py-3 ${specialConfig?.className || ""}`}>
							<Skeleton loading={log.loading} active>
								<List.Item.Meta
									avatar={
										specialConfig ? (
											<div className="text-xl">{specialConfig.icon}</div>
										) : (
											<Tag
												color={LOG_LEVEL_COLOR[log.level]}
												icon={LOG_LEVEL_ICON[log.level]}
												className="!m-0 w-20"
											>
												{log.level.toUpperCase()}
											</Tag>
										)
									}
									title={
										<Text className={`text-sm ${specialConfig ? "font-semibold" : ""}`}>
											{log.message}
										</Text>
									}
									description={
										<Text type="secondary">
											{dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
										</Text>
									}
								/>
							</Skeleton>
						</List.Item>
						{specialConfig && <Divider className="!my-2" />}
					</>
				);
			}}
			loadMore={loadMore}
		/>
	);
};

export default DiagnosisLogsList;
