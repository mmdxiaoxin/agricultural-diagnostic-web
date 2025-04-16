import { DatasetMeta } from "@/api/interface";
import { useAppSelector } from "@/hooks";
import { formatSize } from "@/utils";
import {
	CopyOutlined,
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	GlobalOutlined,
	LockOutlined
} from "@ant-design/icons";
import { Button, Popconfirm, Popover, Switch, Tag, Tooltip } from "antd";
import { motion } from "framer-motion";
import React, { useState } from "react";
import clsx from "clsx";

export interface DatasetCardProps {
	dataset: DatasetMeta;
	onEdit?: (datasetId: number) => void;
	onDelete?: (datasetId: number) => void;
	onDownload?: (datasetId: number) => void;
	onCopy?: (datasetId: number) => void;
	onAccessChange?: (datasetId: number, access: "public" | "private") => void;
	isPublic?: boolean;
	index?: number;
}

const DatasetCard: React.FC<DatasetCardProps> = ({
	dataset,
	onEdit,
	onDelete,
	onDownload,
	onCopy,
	onAccessChange,
	isPublic = false,
	index = 0
}) => {
	const { user } = useAppSelector(state => state.user);
	const isOwner = user.id === dataset.createdBy;
	const [accessLoading, setAccessLoading] = useState(false);

	const handleAccessChange = async (checked: boolean) => {
		if (!onAccessChange) return;
		setAccessLoading(true);
		try {
			await onAccessChange(dataset.id, checked ? "public" : "private");
		} finally {
			setAccessLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.1 }}
			className={clsx(
				"bg-white",
				"rounded-xl overflow-hidden",
				"shadow-lg transition-all duration-300",
				"hover:shadow-2xl hover:scale-[1.02]",
				"border border-gray-100",
				"group"
			)}
		>
			{/* 卡片头部 */}
			<div className="relative h-32 bg-gradient-to-r from-blue-50 to-indigo-50">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
						{dataset.access === "public" ? (
							<GlobalOutlined className="text-2xl text-blue-500" />
						) : (
							<LockOutlined className="text-2xl text-gray-500" />
						)}
					</div>
				</div>
			</div>

			{/* 卡片内容 */}
			<div className="p-6">
				<div className="flex flex-col h-full">
					{/* 标题区域 */}
					<div className="flex justify-between items-start mb-4">
						<div className="flex-1">
							<h3 className="text-xl font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
								{dataset.name}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								{isPublic && (
									<Tag color="blue" className="ml-2">
										公共
									</Tag>
								)}
								{isOwner && !isPublic && <Tag color="green">我的</Tag>}
								{isOwner && (
									<Popover
										content={
											<div className="flex items-center gap-2 p-2">
												<span className="text-sm text-gray-600">
													{dataset.access === "public" ? "公开访问" : "私有访问"}
												</span>
												<Switch
													checked={dataset.access === "public"}
													onChange={handleAccessChange}
													loading={accessLoading}
													checkedChildren={<GlobalOutlined />}
													unCheckedChildren={<LockOutlined />}
												/>
											</div>
										}
										trigger="click"
									>
										<Tag
											color={dataset.access === "public" ? "blue" : "default"}
											className="cursor-pointer hover:opacity-80 transition-opacity"
										>
											{dataset.access === "public" ? (
												<>
													<GlobalOutlined className="mr-1" />
													公开
												</>
											) : (
												<>
													<LockOutlined className="mr-1" />
													私有
												</>
											)}
										</Tag>
									</Popover>
								)}
							</div>
						</div>
					</div>

					{/* 描述区域 */}
					<div className="mb-4">
						<p className="text-gray-600 line-clamp-2 min-h-10 mb-2">
							{dataset.description || "暂无描述"}
						</p>
						<div className="flex flex-wrap gap-2">
							<Tag color="green" className="whitespace-nowrap">
								文件数: {dataset.fileCount}
							</Tag>
							<Tag color="blue" className="whitespace-nowrap">
								{formatSize(dataset.datasetSize || 0)}
							</Tag>
						</div>
					</div>

					{/* 操作按钮区域 */}
					<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
						{!isPublic && isOwner && (
							<>
								<Tooltip title="编辑数据集">
									<Button
										type="text"
										icon={<EditOutlined />}
										onClick={() => onEdit?.(dataset.id)}
										className="text-blue-500 hover:text-blue-700"
									/>
								</Tooltip>
								<Popconfirm
									title="确认删除?"
									description="删除数据集后不可恢复"
									onConfirm={() => onDelete?.(dataset.id)}
									okText="确认"
									cancelText="取消"
								>
									<Tooltip title="删除数据集">
										<Button
											type="text"
											danger
											icon={<DeleteOutlined />}
											className="text-red-500 hover:text-red-700"
										/>
									</Tooltip>
								</Popconfirm>
							</>
						)}

						<Tooltip title="下载数据集">
							<Button
								type="text"
								icon={<DownloadOutlined />}
								onClick={() => onDownload?.(dataset.id)}
								className="text-green-500 hover:text-green-700"
							/>
						</Tooltip>

						<Tooltip title="复制数据集">
							<Button
								type="text"
								icon={<CopyOutlined />}
								onClick={() => onCopy?.(dataset.id)}
								className="text-purple-500 hover:text-purple-700"
							/>
						</Tooltip>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default DatasetCard;
