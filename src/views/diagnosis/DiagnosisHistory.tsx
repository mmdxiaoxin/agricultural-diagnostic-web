import { DiagnosisHistory } from "@/api/interface/diagnosis";
import {
	deleteDiagnosisHistories,
	deleteDiagnosisHistory,
	getDiagnosisHistoryList
} from "@/api/modules";
import DiagnosisDetailModal, {
	DiagnosisDetailModalRef
} from "@/components/Modal/DiagnosisDetailModal";
import { DeleteOutlined, SelectOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag, Typography, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";

const { Text } = Typography;

const DiagnosisHistoryPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DiagnosisHistory[]>([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isSelectMode, setIsSelectMode] = useState(false);
	const modalRef = useRef<DiagnosisDetailModalRef>(null);

	// 获取诊断历史列表
	const fetchDiagnosisHistory = async (page: number = 1, pageSize: number = 10) => {
		setLoading(true);
		try {
			const response = await getDiagnosisHistoryList({ page, pageSize });
			if (response.code === 200 && response.data) {
				setData(response.data.list);
				setPagination({
					current: page,
					pageSize,
					total: response.data.total
				});
			}
		} catch (error) {
			console.error("获取诊断历史失败", error);
			message.error("获取诊断历史失败");
		} finally {
			setLoading(false);
		}
	};

	// 删除诊断历史
	const handleDelete = async (id: number) => {
		try {
			await deleteDiagnosisHistory(id);
			message.success("删除成功");
			fetchDiagnosisHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("删除失败", error);
			message.error("删除失败");
		}
	};

	// 批量删除
	const handleBatchDelete = async () => {
		try {
			await deleteDiagnosisHistories({ diagnosisIds: selectedRowKeys.join(",") });
			message.success("批量删除成功");
			setSelectedRowKeys([]);
			setIsSelectMode(false);
			fetchDiagnosisHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("批量删除失败", error);
			message.error("批量删除失败");
		}
	};

	// 查看详情
	const handleViewDetail = (record: DiagnosisHistory) => {
		modalRef.current?.open(record);
	};

	// 表格列定义
	const columns: ColumnsType<DiagnosisHistory> = [
		{
			title: "诊断时间",
			dataIndex: "createdAt",
			width: 180,
			render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss")
		},
		{
			title: "状态",
			dataIndex: "status",
			width: 100,
			render: (status: string) => (
				<Tag color={status === "completed" ? "success" : "processing"}>{status}</Tag>
			)
		},
		{
			title: "诊断结果",
			dataIndex: "diagnosisResult",
			width: 200,
			render: (diagnosisResult: DiagnosisHistory["diagnosisResult"]) => {
				if (!diagnosisResult) return <Text type="secondary">无结果</Text>;
				const predictions = diagnosisResult.predictions;

				// 生成完整的结果文本
				const fullResult = predictions
					.map(
						prediction =>
							`${prediction.type === "classify" ? "分类" : "检测"}: ${prediction.class_name} (${(prediction.confidence * 100).toFixed(2)}%)`
					)
					.join("\n");

				// 如果预测结果超过2个，则只显示前2个
				const displayPredictions = predictions.slice(0, 2);
				const hasMore = predictions.length > 2;

				return (
					<Tooltip title={hasMore ? fullResult : null}>
						<Space direction="vertical" size={0}>
							{displayPredictions.map((prediction, index) => (
								<Text key={index}>
									{prediction.type === "classify" ? "分类" : "检测"}: {prediction.class_name} (
									{(prediction.confidence * 100).toFixed(2)}%)
								</Text>
							))}
							{hasMore && (
								<Text type="secondary" className="text-xs">
									等 {predictions.length} 个结果...
								</Text>
							)}
						</Space>
					</Tooltip>
				);
			}
		},
		{
			title: "操作",
			key: "action",
			fixed: "right",
			width: 120,
			render: (_, record) => (
				<Space>
					<Button type="link" onClick={() => handleViewDetail(record)}>
						查看
					</Button>
					<Popconfirm
						title="确定要删除这条诊断记录吗？"
						description="删除后将无法恢复"
						onConfirm={() => handleDelete(record.id)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="link" danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	// 表格变化处理
	const handleTableChange = (newPagination: any) => {
		fetchDiagnosisHistory(newPagination.current, newPagination.pageSize);
	};

	// 选择模式切换
	const toggleSelectMode = () => {
		setIsSelectMode(!isSelectMode);
		setSelectedRowKeys([]);
	};

	useEffect(() => {
		fetchDiagnosisHistory();
	}, []);

	return (
		<div title="诊断历史" className={clsx("h-full", "bg-white rounded-lg overflow-y-auto px-4")}>
			<div className="p-4 border-b border-gray-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							type={isSelectMode ? "primary" : "default"}
							icon={<SelectOutlined />}
							onClick={toggleSelectMode}
							className={clsx(
								"transition-all duration-200",
								isSelectMode && "bg-blue-500 hover:bg-blue-600"
							)}
						>
							{isSelectMode ? "退出选择" : "批量选择"}
						</Button>
						{isSelectMode && (
							<Popconfirm
								title="确定要删除选中的记录吗？"
								description={`已选择 ${selectedRowKeys.length} 条记录，删除后将无法恢复`}
								onConfirm={handleBatchDelete}
								okText="确定"
								cancelText="取消"
							>
								<Button
									danger
									icon={<DeleteOutlined />}
									disabled={selectedRowKeys.length === 0}
									className="transition-all duration-200"
								>
									批量删除
								</Button>
							</Popconfirm>
						)}
					</div>
					{isSelectMode && (
						<div className="flex items-center gap-2">
							<Tag color="blue" className="px-3 py-1 rounded-full">
								已选择 {selectedRowKeys.length} 条记录
							</Tag>
						</div>
					)}
				</div>
			</div>
			<Table
				rowSelection={
					isSelectMode
						? {
								selectedRowKeys,
								onChange: newSelectedRowKeys => {
									setSelectedRowKeys(newSelectedRowKeys);
								}
							}
						: undefined
				}
				columns={columns}
				dataSource={data}
				rowKey="id"
				pagination={pagination}
				loading={loading}
				onChange={handleTableChange}
				scroll={{ x: 1000 }}
				className={clsx("transition-all duration-200", isSelectMode && "bg-gray-50")}
			/>
			<DiagnosisDetailModal ref={modalRef} />
		</div>
	);
};

export default DiagnosisHistoryPage;
