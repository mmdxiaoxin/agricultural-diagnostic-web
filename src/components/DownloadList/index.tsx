import { FileMeta } from "@/api/interface";
import { DownloadProgress } from "@/api/modules/file";
import { formatSize } from "@/utils";
import {
	AudioOutlined,
	FileImageOutlined,
	FileOutlined,
	FileTextOutlined
} from "@ant-design/icons";
import { Avatar, Button, Flex, List, Progress, Space, Switch, Tooltip } from "antd";
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

const getStatus = (percent: number, fileSize?: number) => {
	if (percent === 100 && fileSize !== undefined) return `已完成 ${formatSize(fileSize)}`;
	if (percent === 0) return "等待中";
	return `下载中 ${formatSize((fileSize || 0) * (percent / 100))} / ${formatSize(fileSize || 0)}`;
};

const DownloadList: React.FC<DownloadListProps> = ({
	progress,
	downloadList,
	onClear,
	compressMode,
	onCheck
}) => {
	return (
		<List
			rowKey={"id"}
			header={
				<Flex align="center" justify="space-between">
					<Space>
						<Tooltip title="下载列表">
							<span>压缩模式：</span>
						</Tooltip>
						<Switch
							checkedChildren="开启"
							unCheckedChildren="关闭"
							checked={compressMode}
							onChange={onCheck}
						/>
					</Space>
					<Button type="primary" onClick={() => onClear?.()}>
						清空记录
					</Button>
				</Flex>
			}
			dataSource={downloadList}
			renderItem={item => {
				const {
					id,
					originalFileName: originalFileName,
					fileSize: fileSize,
					fileType: fileType
				} = item;
				const percent = progress[id] || 0;
				return (
					<List.Item>
						<List.Item.Meta
							avatar={<Avatar icon={getFileTypeIcon(fileType)} />}
							title={
								<Tooltip title={originalFileName}>
									<span
										style={{
											fontWeight: 500,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap"
										}}
									>
										{originalFileName}
									</span>
								</Tooltip>
							}
							description={
								<>
									<div style={{ marginTop: 8 }}>
										<Progress percent={percent} size="small" />
									</div>
									<div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
										{getStatus(percent, fileSize)}
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
