import { FileMeta } from "@/api/interface";
import { DownloadProgress } from "@/api/modules/file";
import { formatSize } from "@/utils";
import {
	AudioOutlined,
	DeleteOutlined,
	FileImageOutlined,
	FileOutlined,
	FileTextOutlined
} from "@ant-design/icons";
import { Avatar, Button, Flex, List, Space, Switch, Tooltip } from "antd";
import clsx from "clsx";
import React from "react";

type DownloadListProps = {
	downloadList: FileMeta[];
	progress: DownloadProgress;
	compressMode?: boolean;
	onCheck?: (
		checked: boolean,
		event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
	) => void;
	onClear?: () => void;
};

// 文件类型图标映射
const fileTypeIcons = {
	image: <FileImageOutlined className="text-xl" />,
	video: <AudioOutlined className="text-xl" />,
	audio: <AudioOutlined className="text-xl" />,
	document: <FileTextOutlined className="text-xl" />,
	default: <FileOutlined className="text-xl" />
};

const getFileTypeIcon = (fileType: string | undefined) => {
	if (!fileType) return fileTypeIcons.default;
	if (fileType.startsWith("image")) return fileTypeIcons.image;
	if (fileType.startsWith("video")) return fileTypeIcons.video;
	if (fileType.startsWith("audio")) return fileTypeIcons.audio;
	if (fileType.startsWith("application")) return fileTypeIcons.document;
	return fileTypeIcons.default;
};

const getStatus = (percent: number, fileSize?: number) => {
	if (percent === 100 && fileSize !== undefined) return `已完成 ${formatSize(fileSize)}`;
	if (percent === 0) return "等待中";
	if (!fileSize) return `下载中 ${percent}%`;
	const downloadedSize = Math.round((fileSize * percent) / 100);
	return `下载中 ${formatSize(downloadedSize)} / ${formatSize(fileSize)}`;
};

const DownloadList: React.FC<DownloadListProps> = ({
	progress,
	downloadList,
	onClear,
	compressMode,
	onCheck
}) => {
	return (
		<div
			className={clsx(
				"flex flex-col gap-6",
				"p-6",
				"rounded-2xl",
				"bg-white",
				"shadow-sm",
				"border border-gray-100",
				"transition-all duration-300",
				"hover:shadow-md"
			)}
		>
			<Flex align="center" justify="space-between">
				<Space>
					<Tooltip title="下载列表">
						<span className="text-gray-600">压缩模式：</span>
					</Tooltip>
					<Switch
						checkedChildren="开启"
						unCheckedChildren="关闭"
						checked={compressMode}
						onChange={onCheck}
						className="bg-gray-200"
					/>
				</Space>
				<Button
					type="primary"
					onClick={() => onClear?.()}
					icon={<DeleteOutlined />}
					className={clsx(
						"px-6 h-10",
						"rounded-lg",
						"bg-red-500 hover:bg-red-600",
						"border-none",
						"shadow-sm hover:shadow-md",
						"transition-all duration-300",
						"flex items-center gap-2"
					)}
				>
					清空记录
				</Button>
			</Flex>

			<List
				rowKey="id"
				dataSource={downloadList}
				className="download-list"
				renderItem={item => {
					const { id, originalFileName, fileSize, fileType } = item;
					const percent = progress[id] || 0;
					return (
						<List.Item
							className={clsx(
								"p-4",
								"rounded-lg",
								"bg-gray-50",
								"border border-gray-200",
								"transition-all duration-300",
								"hover:shadow-md"
							)}
						>
							<List.Item.Meta
								avatar={
									<Avatar
										icon={getFileTypeIcon(fileType)}
										className={clsx(
											"w-10 h-10",
											"rounded-lg",
											"bg-white",
											"flex items-center justify-center",
											"text-gray-500"
										)}
									/>
								}
								title={
									<Tooltip title={originalFileName}>
										<span className={clsx("text-sm font-medium text-gray-800", "truncate block")}>
											{originalFileName}
										</span>
									</Tooltip>
								}
								description={
									<div className="mt-2 space-y-2 pr-4">
										<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
											<div
												className={clsx("h-full", "bg-blue-500", "transition-all duration-300")}
												style={{ width: `${percent}%` }}
											/>
										</div>
										<p className="text-xs text-gray-500">{getStatus(percent, fileSize)}</p>
									</div>
								}
							/>
						</List.Item>
					);
				}}
			/>
		</div>
	);
};

export default DownloadList;
