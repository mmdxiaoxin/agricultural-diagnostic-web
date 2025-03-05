import { DatasetMeta } from "@/api/interface";
import { deleteDataset, getDatasetsList } from "@/api/modules";
import DatasetsList from "@/components/List/DatasetsList";
import { Button, message, Spin } from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	const [loading, setLoading] = useState<boolean>(false); // 控制加载状态
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]); // 存储数据集
	const [hasMore, setHasMore] = useState<boolean>(true); // 是否还有更多数据
	const pageRef = useRef<number>(1); // 使用 useRef 来保存最新的页码，避免异步问题
	const loadMoreRef = useRef<HTMLDivElement | null>(null); // 用来绑定底部目标元素
	const navigate = useNavigate();

	// 请求数据集列表
	const fetchListData = async (currentPage: number) => {
		if (loading || !hasMore) return; // 防止重复请求
		setLoading(true);
		try {
			const res = await getDatasetsList({ page: currentPage, pageSize: 10 });
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			const newList = res.data.list;
			setDatasets(prevDatasets => [...prevDatasets, ...newList]); // 将新数据追加到旧数据后面

			// 如果返回的数据少于请求的页数，说明没有更多数据了
			setHasMore(res.data.list.length === 10); // 假设每页最多 10 条数据
		} catch (error) {
			message.error("加载文件列表失败");
		} finally {
			setLoading(false);
		}
	};

	// 初始化加载第一页数据
	useEffect(() => {
		fetchListData(pageRef.current);
	}, []);

	// 设置 IntersectionObserver 来监视加载更多元素
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				// 如果目标元素进入视口并且还有更多数据
				if (entries[0].isIntersecting && hasMore) {
					pageRef.current += 1; // 更新最新的页码
					fetchListData(pageRef.current); // 加载下一页
				}
			},
			{
				rootMargin: "0px 0px 100px 0px" // 设置在接近底部时就开始加载
			}
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		// 清理 observer
		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [hasMore]);

	// 新增数据集
	const handleAdd = () => {
		navigate("/capture/dataset/create");
	};

	// 编辑数据集
	const handleEdit = (datasetId: number) => {
		navigate(`/capture/dataset/edit/${datasetId}`);
	};

	// 删除数据集
	const handleDelete = async (datasetId: number) => {
		try {
			await deleteDataset(datasetId);
			// 删除后重新加载列表
			fetchListData(pageRef.current);
			message.success("文件删除成功");
		} catch (error) {
			message.error("删除文件失败");
		}
	};

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-4",
				"rounded-lg",
				"flex flex-col",
				"bg-white overflow-y-auto"
			)}
		>
			<div
				className={clsx(
					"flex justify-between items-center",
					"mb-4 p-4",
					"rounded-2xl bg-[#f6f6f6]"
				)}
			>
				<Button onClick={handleAdd}>新增</Button>
			</div>
			<DatasetsList datasets={datasets} onEdit={handleEdit} onDelete={handleDelete} />
			{/* 触发懒加载的目标元素 */}
			{hasMore && (
				<div ref={loadMoreRef} className="h-24 flex justify-center items-center">
					<Spin spinning={loading} size="large" />
				</div>
			)}
		</div>
	);
};

export default DatasetManage;
