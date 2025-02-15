import { FileMeta } from "@/api/interface";
import { DownloadProgress } from "@/api/modules/file";
import { formatSize } from "@/utils";
import {
	AudioOutlined,
	FileImageOutlined,
	FileOutlined,
	FileTextOutlined
} from "@ant-design/icons";
import { Avatar, Button, Flex, List, Progress, Tooltip } from "antd";
import React from "react";

type DownloadListProps = {
	downloadList: FileMeta[];
	progress: DownloadProgress;
	onClear?: () => void;
};

// 文件类型图标映射
const fileTypeIcons = {
	image: <FileImageOutlined />,
	video: <AudioOutlined />,
	audio: <AudioOutlined />,
	document: <FileTextOutlined />,
	default: <FileOutlined />
};

const getFileTypeIcon = (fileType: string) => {
	if (fileType.startsWith("image")) return fileTypeIcons.image;
	if (fileType.startsWith("video")) return fileTypeIcons.video;
	if (fileType.startsWith("audio")) return fileTypeIcons.audio;
	if (fileType.startsWith("application")) return fileTypeIcons.document;
	return fileTypeIcons.default;
};

const getStatus = (percent: number, file_size?: number) => {
	if (percent === 100 && file_size !== undefined) return `已完成 ${formatSize(file_size)}`;
	if (percent === 0) return "等待中";
	return `下载中 ${formatSize((file_size || 0) * (percent / 100))} / ${formatSize(file_size || 0)}`;
};

const DownloadList: React.FC<DownloadListProps> = ({ progress, downloadList, onClear }) => {
	return (
		<List
			rowKey={"id"}
			header={
				<Flex align="center" justify="space-between">
					<Button type="primary" onClick={() => onClear?.()}>
						清空记录
					</Button>
				</Flex>
			}
			dataSource={downloadList}
			renderItem={item => {
				const { id, original_file_name, file_size, file_type } = item;
				const percent = progress[id] || 0;
				return (
					<List.Item>
						<List.Item.Meta
							avatar={<Avatar icon={getFileTypeIcon(file_type)} />}
							title={
								<Tooltip title={original_file_name}>
									<span
										style={{
											fontWeight: 500,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap"
										}}
									>
										{original_file_name}
									</span>
								</Tooltip>
							}
							description={
								<>
									<div style={{ marginTop: 8 }}>
										<Progress percent={percent} size="small" />
									</div>
									<div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
										{getStatus(percent, file_size)}
									</div>
								</>
							}
						/>
					</List.Item>
				);
			}}
		/>
	);
};

export default DownloadList;
