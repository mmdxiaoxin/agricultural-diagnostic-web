import { DiskUsageReport, FileMeta } from "@/api/interface";
import { getDiskUsage, getFileList } from "@/api/modules/file";
import DiskSpaceUsageChart from "@/components/ECharts/DiskSpaceUsageChart";
import FileStatisticCard from "@/components/Card/FileStatisticCard";
import FilePreview from "@/components/Table/FilePreview";
import FileTypeTag from "@/components/Table/FileTypeTag";
import { MIMETypeValue } from "@/constants/mimeType";
import { formatSize, getFileType } from "@/utils";
import { ReloadOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	message,
	Progress,
	Table,
	TableColumnsType,
	Tooltip,
	Typography
} from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useMemo, useState } from "react";

const { Title, Text } = Typography;
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
		border: selectedType === type ? "2px solid #1890ff" : "1px solid #f0f0f0",
		borderRadius: "16px",
		boxSizing: "border-box",
		transition: "all 0.3s ease",
		transform: selectedType === type ? "translateY(-2px)" : "none",
		boxShadow: selectedType === type ? "0 4px 12px rgba(24, 144, 255, 0.1)" : "none"
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
			render: (type: MIMETypeValue) => <FileTypeTag type={type} />
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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5
			}
		}
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className={clsx(
				"min-h-screen",
				"p-4 sm:p-6 lg:p-8",
				"bg-gradient-to-br from-gray-50 to-white",
				"space-y-4 sm:space-y-6 lg:space-y-8"
			)}
		>
			{/* 顶部统计卡片 */}
			<motion.div variants={itemVariants}>
				<Card
					className={clsx(
						"rounded-2xl",
						"bg-white",
						"shadow-sm",
						"border-0",
						"transition-all duration-300",
						"hover:shadow-md"
					)}
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
						<div>
							<Title level={3} className="!mb-2">
								存储空间概览
							</Title>
							<Text type="secondary">
								已用 {formattedUsedSpace} / 总空间 {formattedTotalSpace}
							</Text>
						</div>
						<Tooltip title="刷新数据">
							<Button
								type="text"
								icon={<ReloadOutlined />}
								onClick={initialize}
								className="text-gray-400 hover:text-blue-500"
							/>
						</Tooltip>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="h-[300px]">
							<DiskSpaceUsageChart usedSpace={totalUsage} />
						</div>
						<div className="space-y-4">
							{Object.entries(diskReport || {}).map(([type, info]) => {
								if (type === "total") return null;
								const percentage = (parseInt(info?.used || "0") / totalSpace) * 100;
								return (
									<div key={type} className="space-y-2">
										<div className="flex justify-between items-center">
											<span className="text-gray-600">{type}</span>
											<span className="text-gray-900 font-medium">
												{formatSize(parseInt(info?.used || "0"))}
											</span>
										</div>
										<Progress
											percent={percentage}
											strokeColor={{
												"0%": "#108ee9",
												"100%": "#87d068"
											}}
											showInfo={false}
										/>
									</div>
								);
							})}
						</div>
					</div>
				</Card>
			</motion.div>

			{/* 文件类型卡片 */}
			<motion.div variants={itemVariants}>
				<Card
					className={clsx(
						"rounded-2xl",
						"bg-white",
						"shadow-sm",
						"border-0",
						"transition-all duration-300",
						"hover:shadow-md"
					)}
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
						<Title level={3} className="!mb-0">
							文件类型统计
						</Title>
						<Button
							type="link"
							onClick={() => handleSelect(undefined)}
							className="text-blue-500 hover:text-blue-600"
						>
							重置
						</Button>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-6 gap-4 sm:gap-6">
						<FileStatisticCard
							info={diskReport?.application}
							type="文档"
							icon={"FileOutlined"}
							color="#ff4848"
							onClick={() => handleSelect("application")}
							style={fileCardStyle("application")}
						/>
						<FileStatisticCard
							info={diskReport?.image}
							type="图片"
							icon={"FileImageOutlined"}
							color="#4892ff"
							onClick={() => handleSelect("image")}
							style={fileCardStyle("image")}
						/>
						<FileStatisticCard
							info={diskReport?.video}
							type="视频"
							icon={"VideoCameraOutlined"}
							color="#aa48ff"
							onClick={() => handleSelect("video")}
							style={fileCardStyle("video")}
						/>
						<FileStatisticCard
							info={diskReport?.audio}
							type="音频"
							icon={"AudioOutlined"}
							color="#ffaa00"
							onClick={() => handleSelect("audio")}
							style={fileCardStyle("audio")}
						/>
						<FileStatisticCard
							info={diskReport?.app}
							type="压缩包"
							icon={"FileZipOutlined"}
							color="#ccc200"
							onClick={() => handleSelect("archive")}
							style={fileCardStyle("archive")}
						/>
						<FileStatisticCard
							info={diskReport?.other}
							type="其他"
							icon={"AppstoreOutlined"}
							color="#ffaa00"
							onClick={() => handleSelect("other")}
							style={fileCardStyle("other")}
						/>
					</div>
				</Card>
			</motion.div>

			{/* 文件列表 */}
			<motion.div variants={itemVariants}>
				<Card
					className={clsx(
						"rounded-2xl",
						"bg-white",
						"shadow-sm",
						"border-0",
						"transition-all duration-300",
						"hover:shadow-md"
					)}
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
						<Title level={3} className="!mb-0">
							文件列表
						</Title>
						<Button
							type="link"
							onClick={() => handleSelect(undefined)}
							className="text-blue-500 hover:text-blue-600"
						>
							重置筛选
						</Button>
					</div>
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
						className={clsx("rounded-lg", "overflow-hidden")}
						scroll={{ x: "max-content" }}
					/>
				</Card>
			</motion.div>
		</motion.div>
	);
};

export default Dashboard;
