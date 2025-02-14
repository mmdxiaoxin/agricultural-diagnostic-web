import { DiskSpaceStatus } from "@/api/interface";
import { formatSize } from "@/utils";
import { Card, Divider } from "antd";
import dayjs from "dayjs";
import React from "react";
import IconComponent, { Icons } from "../IconComponent";
import styles from "./index.module.scss"; // 样式文件

// 组件属性接口
interface FileCardProps extends React.HTMLAttributes<HTMLDivElement> {
	info?: DiskSpaceStatus;
	type: string; // 文件类型，如 '文件'
	icon?: keyof typeof Icons; // 图标（可以是 URL 或者字体图标）
	color?: string; // 图标底色
}

const FileCard: React.FC<FileCardProps> = ({ info, type, icon, color = "#655df0", ...props }) => {
	return (
		<div className={styles.container} {...props}>
			<Card className={styles.card}>
				<div className={styles.size}>{formatSize(info?.used ? Number(info?.used) : 0)}</div>
				<div className={styles.type}>{type}</div>
				<Divider className={styles.divider} />
				<div className={styles.updated}>
					<span>{`上次更新`}</span>
					<span>
						{info?.last_updated
							? dayjs(info?.last_updated).format("YYYY-MM-DD HH:mm:ss")
							: "当前暂无文件存储记录"}
					</span>
				</div>
			</Card>
			<div className={styles.icon} style={{ backgroundColor: color }}>
				<IconComponent name={icon || "FileOutlined"} color="white" size={18} />
			</div>
		</div>
	);
};

export default FileCard;
