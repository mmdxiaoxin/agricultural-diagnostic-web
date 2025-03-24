import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { downloadFile, getDiagnosisHistoryList } from "@/api/modules";
import { Button, Flex, List, Skeleton, Space, Tooltip, Typography } from "antd";
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

	const onLoadMore = () => {
		setLoading(true);
		setDiagnosisList(prevList => prevList.concat(Array(pageSize).fill({ loading: true })));
		const nextPage = currentPage + 1;
		getDiagnosisHistoryList({ page: nextPage, pageSize })
			.then(async response => {
				if (response.code === 200 && response.data) {
					const newDiagnosisList = await Promise.all(
						response.data.list.map(async (diagnosis: DiagnosisHistory) => {
							const imageUrl = await loadImage(diagnosis.id);
							return { ...diagnosis, loading: false, imageUrl };
						})
					);
					setDiagnosisList(prev => [...prev, ...newDiagnosisList]);
					setCurrentPage(nextPage);
				}
			})
			.catch(error => {
				console.error("加载更多失败", error);
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
						const imageUrl = await loadImage(diagnosis.id);
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
					<List.Item className="hover:bg-gray-100 rounded-lg cursor-pointer">
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
