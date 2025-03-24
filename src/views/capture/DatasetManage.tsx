import { DatasetMeta } from "@/api/interface";
import { deleteDataset, getDatasetsList } from "@/api/modules";
import DatasetsList from "@/components/List/DatasetsList";
import { FolderAddOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, FloatButton, Input, message, Spin, Tabs } from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [searchText, setSearchText] = useState("");
	const [activeTab, setActiveTab] = useState("1");
	const pageRef = useRef<number>(1);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	// 请求数据集列表
	const fetchListData = async (currentPage: number) => {
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			const res = await getDatasetsList({ page: currentPage, pageSize: 10 });
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			const newList = res.data.list;
			setDatasets(prevDatasets => [...prevDatasets, ...newList]);
			setHasMore(res.data.list.length === 10);
		} catch (error) {
			message.error("加载文件列表失败");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchListData(pageRef.current);
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasMore) {
					pageRef.current += 1;
					fetchListData(pageRef.current);
				}
			},
			{
				rootMargin: "0px 0px 100px 0px"
			}
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [hasMore]);

	const handleAdd = () => {
		navigate("/capture/dataset/create");
	};

	const handleEdit = (datasetId: number) => {
		navigate(`/capture/dataset/edit/${datasetId}`);
	};

	const handleDelete = async (datasetId: number) => {
		try {
			await deleteDataset(datasetId);
			setDatasets(datasets.filter(dataset => dataset.id !== datasetId));
			message.success("文件删除成功");
		} catch (error) {
			message.error("删除文件失败");
		}
	};

	const filteredDatasets = datasets.filter(dataset =>
		dataset.name.toLowerCase().includes(searchText.toLowerCase())
	);

	const items = [
		{
			key: "1",
			label: "全部数据集",
			children: (
				<div className="flex-1">
					<DatasetsList datasets={filteredDatasets} onEdit={handleEdit} onDelete={handleDelete} />
				</div>
			)
		},
		{
			key: "2",
			label: "我的数据集",
			children: (
				<div className="flex-1">
					<DatasetsList datasets={filteredDatasets} onEdit={handleEdit} onDelete={handleDelete} />
				</div>
			)
		}
	];

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<div
				className={clsx(
					"flex flex-col gap-6",
					"mb-6 p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<div className="flex justify-between items-center">
					<div className="flex flex-col">
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">数据集管理</h2>
						<p className="text-gray-500">共 {datasets.length} 个数据集</p>
					</div>
					<div className="flex items-center gap-4">
						<Input
							placeholder="搜索数据集..."
							prefix={<SearchOutlined className="text-gray-400" />}
							value={searchText}
							onChange={e => setSearchText(e.target.value)}
							className={clsx(
								"w-64",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleAdd}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							新增数据集
						</Button>
					</div>
				</div>

				<Tabs
					activeKey={activeTab}
					onChange={setActiveTab}
					items={items}
					className="mt-4"
					tabBarStyle={{
						marginBottom: 16,
						borderBottom: "1px solid #f0f0f0"
					}}
				/>
			</div>

			{hasMore && (
				<div ref={loadMoreRef} className={clsx("h-24", "flex justify-center items-center", "mt-4")}>
					<Spin spinning={loading} size="large" className="text-blue-500" />
				</div>
			)}

			<FloatButton
				icon={<FolderAddOutlined className="text-lg" />}
				description="快速创建"
				style={{
					insetInlineEnd: 32,
					insetBlockEnd: 32,
					width: 56,
					height: 56,
					boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
					background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
					border: "none",
					transition: "all 0.3s ease",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "4px"
				}}
				onClick={handleAdd}
				className={clsx("z-10", "hover:scale-110", "hover:shadow-lg", "active:scale-95", "group")}
				shape="circle"
			>
				<div className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					快速创建
				</div>
			</FloatButton>
		</div>
	);
};

export default DatasetManage;
