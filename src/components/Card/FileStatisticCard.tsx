import { DiskSpaceStatus } from "@/api/interface";
import { formatSize } from "@/utils";
import { Card, Tooltip } from "antd";
import dayjs from "dayjs";
import React from "react";
import IconComponent, { Icons } from "../IconComponent";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

// 组件属性接口
interface FileCardProps extends Omit<HTMLMotionProps<"div">, "onDrag"> {
	info?: DiskSpaceStatus;
	type: string; // 文件类型，如 '文件'
	icon?: keyof typeof Icons; // 图标（可以是 URL 或者字体图标）
	color?: string; // 图标底色
}

const FileStatisticCard: React.FC<FileCardProps> = ({
	info,
	type,
	icon,
	color = "#655df0",
	...props
}) => {
	const cardVariants = {
		hover: {
			scale: 1.02,
			transition: {
				duration: 0.2
			}
		}
	};

	return (
		<motion.div variants={cardVariants} whileHover="hover" className="relative h-full" {...props}>
			<Card
				className={clsx(
					"h-full",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border-0",
					"transition-all duration-300",
					"hover:shadow-md",
					"flex flex-col"
				)}
			>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div
							className={clsx(
								"w-10 h-10",
								"rounded-xl",
								"flex items-center justify-center",
								"transition-all duration-300"
							)}
							style={{ backgroundColor: color }}
						>
							<IconComponent name={icon || "FileOutlined"} color="white" size={20} />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-800">{type}</h3>
							<p className="text-sm text-gray-500">文件类型</p>
						</div>
					</div>
				</div>

				<div className="flex-1 flex flex-col justify-between">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">存储空间</span>
							<span className="text-base font-medium text-gray-900">
								{formatSize(info?.used ? Number(info?.used) : 0)}
							</span>
						</div>
						<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-500"
								style={{
									width: `${(Number(info?.used || 0) / 1000000000) * 100}%`,
									backgroundColor: color
								}}
							/>
						</div>
					</div>

					<div className="mt-4 pt-4 border-t border-gray-100">
						<Tooltip
							title={
								info?.last_updated
									? dayjs(info?.last_updated).format("YYYY-MM-DD HH:mm:ss")
									: "暂无更新记录"
							}
						>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500">上次更新</span>
								<span className="text-gray-700">
									{info?.last_updated
										? dayjs(info?.last_updated).format("MM-DD HH:mm")
										: "暂无记录"}
								</span>
							</div>
						</Tooltip>
					</div>
				</div>
			</Card>
		</motion.div>
	);
};

export default FileStatisticCard;
