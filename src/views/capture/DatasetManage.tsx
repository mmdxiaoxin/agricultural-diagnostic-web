import { DatasetMeta } from "@/api/interface";
import { deleteDataset, getDatasetsList } from "@/api/modules";
import DatasetsList from "@/components/DatasetsList";
import { Button, message } from "antd";
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	const [loading, setLoading] = useState<boolean>(false); // 控制加载状态
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]); // 存储数据集
	const [page, setPage] = useState<number>(1); // 当前页码
	const [hasMore, setHasMore] = useState<boolean>(true); // 是否还有更多数据
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
			setDatasets(prevDatasets => [...prevDatasets, ...res.data.list]); // 将新数据追加到旧数据后面

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
		fetchListData(page);
	}, [page]);

	// 监听滚动事件，触发懒加载
	const handleScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			const bottom =
				event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
			if (bottom && hasMore) {
				setPage(prevPage => prevPage + 1); // 如果接近底部，加载下一页
			}
		},
		[hasMore]
	);

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
			await fetchListData(page);
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
			onScroll={handleScroll} // 添加滚动事件监听
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
			<div className="mb-24">
				<DatasetsList
					loading={loading}
					datasets={datasets}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
};

export default DatasetManage;
