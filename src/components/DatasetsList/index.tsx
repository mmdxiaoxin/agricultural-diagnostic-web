import { DatasetMeta } from "@/api/interface";
import { formatSize } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Tag, Spin } from "antd";
import React, { useState, useEffect, useRef } from "react";

export interface DatasetsListProps {
	datasets?: DatasetMeta[];
	onEdit?: (datasetId: number) => void;
	onDelete?: (datasetId: number) => void;
	loadMoreData?: () => void;
	loading?: boolean;
}

const DatasetsList: React.FC<DatasetsListProps> = ({
	datasets,
	onEdit,
	onDelete,
	loadMoreData,
	loading
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	const handleScroll = () => {
		if (!listRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = listRef.current;
		if (scrollHeight - scrollTop === clientHeight && !isLoading) {
			setIsLoading(true);
			loadMoreData?.();
		}
	};

	useEffect(() => {
		if (loading !== undefined) {
			setIsLoading(loading);
		}
	}, [loading]);

	return (
		<div
			ref={listRef}
			onScroll={handleScroll}
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 ease-in-out overflow-y-auto"
			style={{ maxHeight: "80vh" }}
		>
			{datasets?.map(dataset => (
				<div
					key={dataset.id}
					className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
				>
					<div className="text-xl font-semibold text-gray-800 mb-2">{dataset.name}</div>
					<div className="mb-4">
						<p className="text-gray-600 line-clamp-2 min-h-10">{dataset.description}</p>
						<div className="flex flex-wrap gap-2 mt-2">
							<Tag color="green" className="whitespace-nowrap">
								文件总数: {dataset.file_count}
							</Tag>
							<span className="text-gray-500">{formatSize(dataset.dataset_size || 0)}</span>
						</div>
					</div>

					<div className="flex justify-between items-center mt-4">
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => onEdit?.(dataset.id)}
							className="text-blue-500 hover:text-blue-700"
						>
							编辑
						</Button>
						<Popconfirm
							title="确认删除?"
							description="删除数据集后不可恢复"
							onConfirm={() => onDelete?.(dataset.id)}
							okText="确认"
							cancelText="取消"
						>
							<Button
								type="link"
								danger
								icon={<DeleteOutlined />}
								className="text-red-500 hover:text-red-700"
							>
								删除
							</Button>
						</Popconfirm>
					</div>
				</div>
			))}

			{/* Loading spinner at the bottom */}
			{isLoading && (
				<div className="col-span-full text-center mt-4">
					<Spin size="large" />
				</div>
			)}
		</div>
	);
};

export default DatasetsList;
