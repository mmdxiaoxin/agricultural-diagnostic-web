import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { deleteDiagnosisHistory, downloadFile, getDiagnosisHistoryList } from "@/api/modules";
import {
	Button,
	Flex,
	List,
	Popconfirm,
	Skeleton,
	Space,
	Tooltip,
	Typography,
	message
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";

const pageSize = 5;

const DiagnosisList: React.FC = () => {
	const [diagnosisList, setDiagnosisList] = useState<
		(DiagnosisHistory & { loading: boolean; imageUrl?: string })[]
	>([]);
	const [initLoading, setInitLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);

	const hasMore = useMemo(() => currentPage < Math.ceil(total / pageSize), [currentPage, total]);

	// 加载图片
	const loadImage = async (fileId: number) => {
		try {
			const blob = await downloadFile(fileId);
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error("图片加载失败", error);
			return undefined;
		}
	};

	// 删除诊断历史
	const handleDelete = async (id: number) => {
		try {
			await deleteDiagnosisHistory(id);
			message.success("删除成功");
			// 重新加载列表
			initDiagnosisList();
		} catch (error) {
			console.error("删除失败", error);
			message.error("删除失败");
		}
	};

	const onLoadMore = () => {
		setLoading(true);
		const nextPage = currentPage + 1;
		// 添加骨架屏
		setDiagnosisList(prevList => prevList.concat(Array(pageSize).fill({ loading: true })));

		getDiagnosisHistoryList({ page: nextPage, pageSize })
			.then(async response => {
				if (response.code === 200 && response.data) {
					const newDiagnosisList = await Promise.all(
						response.data.list.map(async (diagnosis: DiagnosisHistory) => {
							const imageUrl = await loadImage(diagnosis.fileId);
							return { ...diagnosis, loading: false, imageUrl };
						})
					);
					// 移除骨架屏并添加新数据
					setDiagnosisList(prev => {
						const filteredList = prev.filter(item => !item.loading);
						return [...filteredList, ...newDiagnosisList];
					});
					setCurrentPage(nextPage);
				}
			})
			.catch(error => {
				console.error("加载更多失败", error);
				// 发生错误时也要移除骨架屏
				setDiagnosisList(prev => prev.filter(item => !item.loading));
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const loadMore = useMemo(
		() =>
			!initLoading && !loading && hasMore ? (
				<div className="text-center mt-3 h-8 leading-8">
					<Button onClick={onLoadMore}>加载更多</Button>
				</div>
			) : null,
		[initLoading, loading, hasMore]
	);

	const initDiagnosisList = async () => {
		setInitLoading(true);
		try {
			setDiagnosisList(Array(pageSize).fill({ loading: true }));
			const response = await getDiagnosisHistoryList({ page: 1, pageSize });
			if (response.code === 200 && response.data) {
				const list = await Promise.all(
					response.data.list.map(async (diagnosis: DiagnosisHistory) => {
						const imageUrl = await loadImage(diagnosis.fileId);
						return { ...diagnosis, loading: false, imageUrl };
					})
				);
				setDiagnosisList(list);
				setTotal(response.data.total);
			}
		} catch (error) {
			console.error("初始化加载失败", error);
		} finally {
			setInitLoading(false);
		}
	};

	useEffect(() => {
		initDiagnosisList();
	}, []);

	// 清理图片URL
	useEffect(() => {
		return () => {
			diagnosisList.forEach(item => {
				if (item.imageUrl) {
					URL.revokeObjectURL(item.imageUrl);
				}
			});
		};
	}, [diagnosisList]);

	// 获取诊断结果信息
	const getDiagnosisInfo = (item: DiagnosisHistory) => {
		if (!item.diagnosisResult) {
			return {
				className: "未知",
				confidence: 0
			};
		}
		const prediction = item.diagnosisResult.predictions[0];
		return {
			className: prediction?.class_name || "未知",
			confidence: prediction?.confidence || 0
		};
	};

	return (
		<List
			rowKey="id"
			header={
				<Flex align="center" justify="space-between">
					<Typography.Title level={4}>诊断历史</Typography.Title>
				</Flex>
			}
			loading={initLoading}
			itemLayout="horizontal"
			dataSource={diagnosisList}
			loadMore={loadMore}
			renderItem={item => {
				const { className, confidence } = getDiagnosisInfo(item);
				return (
					<List.Item
						className="hover:bg-gray-100 rounded-lg cursor-pointer group"
						actions={[
							<Popconfirm
								key="delete"
								title="确定要删除这条诊断记录吗？"
								description="删除后将无法恢复"
								onConfirm={() => handleDelete(item.id)}
								okText="确定"
								cancelText="取消"
							>
								<Button
									type="text"
									danger
									icon={<DeleteOutlined />}
									className="opacity-0 group-hover:opacity-100 transition-opacity"
								/>
							</Popconfirm>
						]}
					>
						<Skeleton avatar title={false} loading={item.loading} active>
							<List.Item.Meta
								avatar={
									<div className="w-12 h-12 rounded-lg overflow-hidden">
										{item.imageUrl ? (
											<img
												src={item.imageUrl}
												alt="诊断图片"
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gray-200 flex items-center justify-center">
												<Typography.Text type="secondary">无图片</Typography.Text>
											</div>
										)}
									</div>
								}
								title={
									<Tooltip title={className}>
										<Typography.Text ellipsis>{className}</Typography.Text>
									</Tooltip>
								}
								description={
									<Space direction="vertical" size={0}>
										<Typography.Text type="secondary">
											诊断时间: {new Date(item.created_at).toLocaleString()}
										</Typography.Text>
										<Typography.Text type="secondary">
											置信度: {(confidence * 100).toFixed(2)}%
										</Typography.Text>
									</Space>
								}
							/>
						</Skeleton>
					</List.Item>
				);
			}}
		/>
	);
};

export default DiagnosisList;
