import { DatasetMeta } from "@/api/interface";
import { useAppSelector } from "@/hooks";
import { formatSize } from "@/utils";
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Tag, Tooltip } from "antd";
import { motion } from "framer-motion";
import React from "react";
import clsx from "clsx";

export interface DatasetsListProps {
	datasets?: DatasetMeta[];
	onEdit?: (datasetId: number) => void;
	onDelete?: (datasetId: number) => void;
	onDownload?: (datasetId: number) => void;
	onCopy?: (datasetId: number) => void;
	isPublic?: boolean;
}

const DatasetsList: React.FC<DatasetsListProps> = ({
	datasets,
	onEdit,
	onDelete,
	onDownload,
	onCopy,
	isPublic = false
}) => {
	const { user } = useAppSelector(state => state.user);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
			{datasets?.map((dataset, index) => (
				<motion.div
					key={dataset.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: index * 0.1 }}
					className={clsx(
						"bg-white p-6 rounded-xl",
						"shadow-lg transition-all duration-300",
						"hover:shadow-2xl hover:scale-[1.02]",
						"border border-gray-100"
					)}
				>
					<div className="flex flex-col h-full">
						<div className="flex-1">
							<div className="flex justify-between items-start mb-4">
								<h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{dataset.name}</h3>
								{isPublic && (
									<Tag color="blue" className="ml-2">
										公共
									</Tag>
								)}
							</div>

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
						</div>

						<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
							{!isPublic && user.id === dataset.createdBy && (
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
				</motion.div>
			))}
		</div>
	);
};

export default DatasetsList;
