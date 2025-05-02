import { DatasetMeta } from "@/api/interface";
import {
	copyDataset,
	deleteDataset,
	downloadDataset,
	getDatasetsList,
	getPublicDatasetsList,
	updateDatasetAccess
} from "@/api/modules";
import DatasetsList from "@/components/List/DatasetsList";
import PageHeader from "@/components/PageHeader";
import { DownloadOutlined, FolderAddOutlined, PlusOutlined } from "@ant-design/icons";
import { FloatButton, message, Spin, Tabs, Tooltip } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [searchText, setSearchText] = useState("");
	const [activeTab, setActiveTab] = useState("2");
	const pageRef = useRef<number>(1);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	// 请求数据集列表
	const fetchListData = async (currentPage: number) => {
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			const res = await (activeTab === "1" ? getPublicDatasetsList : getDatasetsList)({
				page: currentPage,
				pageSize: 10
			});
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

	// 切换标签页时重置数据
	const handleTabChange = (key: string) => {
		setActiveTab(key);
		setDatasets([]);
		pageRef.current = 1;
		setHasMore(true);
		fetchListData(1);
	};

	useEffect(() => {
		// 初始加载数据
		fetchListData(1);

		// 设置无限滚动观察者
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && hasMore && !loading) {
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
	}, [activeTab]); // 只在 activeTab 变化时重新设置观察者

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

	const handleDownload = async (datasetId: number) => {
		try {
			const dataset = datasets.find(d => d.id === datasetId);
			if (!dataset) {
				throw new Error("数据集不存在");
			}

			const response = await downloadDataset(datasetId);
			const blob = new Blob([response]);
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `${dataset.name}.zip`;
			document.body.appendChild(a);
			a.click();

			// 清理资源
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			message.success("数据集下载成功");
		} catch (error) {
			console.error("下载失败:", error);
			message.error("下载数据集失败");
		}
	};

	const handleCopy = async (datasetId: number) => {
		try {
			const res = await copyDataset(datasetId);
			if (res.code === 201 && res.data) {
				// 将新数据集添加到列表开头，并确保类型正确
				setDatasets(prevDatasets => [res.data as DatasetMeta, ...prevDatasets]);
				message.success("数据集复制成功");
			} else {
				throw new Error(res.message);
			}
		} catch (error) {
			message.error("数据集复制失败");
		}
	};

	const handleAccessChange = async (datasetId: number, access: "public" | "private") => {
		try {
			await updateDatasetAccess(datasetId, access);
			setDatasets(
				datasets.map(dataset => (dataset.id === datasetId ? { ...dataset, access } : dataset))
			);
			message.success(`数据集已${access === "public" ? "公开" : "设为私有"}`);
		} catch (error) {
			message.error("修改访问权限失败");
		}
	};

	const filteredDatasets = datasets.filter(dataset =>
		dataset.name.toLowerCase().includes(searchText.toLowerCase())
	);

	const items = [
		{
			key: "1",
			label: (
				<div className="flex items-center gap-2">
					<span>公共数据集</span>
					<Tooltip title="可下载和复制公共数据集">
						<DownloadOutlined className="text-blue-500" />
					</Tooltip>
				</div>
			),
			children: (
				<div className="flex-1">
					<DatasetsList
						datasets={filteredDatasets.filter(dataset => dataset.access === "public")}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onDownload={handleDownload}
						onCopy={handleCopy}
						onAccessChange={handleAccessChange}
						isPublic={true}
					/>
				</div>
			)
		},
		{
			key: "2",
			label: "我的数据集",
			children: (
				<div className="flex-1">
					<DatasetsList
						datasets={filteredDatasets}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onDownload={handleDownload}
						onCopy={handleCopy}
						onAccessChange={handleAccessChange}
						isPublic={false}
					/>
				</div>
			)
		}
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<PageHeader
				title="数据集管理"
				description={`共 ${datasets.length} 个数据集`}
				search={{
					placeholder: "搜索数据集...",
					value: searchText,
					onChange: value => setSearchText(value),
					onSearch: () => {},
					className: "w-64"
				}}
				actionButton={{
					text: "新增数据集",
					icon: <PlusOutlined />,
					onClick: handleAdd,
					type: "primary"
				}}
			/>

			<div
				className={clsx(
					"flex flex-col gap-6",
					"mb-6 p-2 lg:p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}
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
		</motion.div>
	);
};

export default DatasetManage;
