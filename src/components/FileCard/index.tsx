import { formatSize } from "@/utils";
import { Divider } from "antd";
import React from "react";
import IconComponent, { Icons } from "../IconComponent";
import styles from "./index.module.scss"; // 样式文件

// 组件属性接口
interface FileCardProps extends React.HTMLAttributes<HTMLDivElement> {
	size: number; // 文件大小 (字节)
	type: string; // 文件类型，如 '文件'
	lastUpdated: string; // 上次更新时间，如 '2023.11.17 11:11'
	icon?: keyof typeof Icons; // 图标（可以是 URL 或者字体图标）
	color?: string; // 图标底色
}

const FileCard: React.FC<FileCardProps> = ({
	size,
	type,
	lastUpdated,
	icon,
	color = "#655df0",
	...props
}) => {
	return (
		<div className={styles.container} {...props}>
			<div className={styles.card}>
				<div className={styles.details}>
					<div className={styles.size}>{formatSize(size)}</div>
					<div className={styles.type}>{type}</div>
					<Divider className={styles.divider} />
					<div className={styles.updated}>
						<span>{`上次更新`}</span>
						<span>{lastUpdated}</span>
					</div>
				</div>
			</div>
			<div className={styles.icon} style={{ backgroundColor: color }}>
				<IconComponent name={icon || "FileOutlined"} color="white" size={18} />
			</div>
		</div>
	);
};

export default FileCard;
