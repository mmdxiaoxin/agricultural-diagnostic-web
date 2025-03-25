import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { AiService } from "@/api/interface/service";
import {
	deleteDiagnosisHistories,
	deleteDiagnosisHistory,
	getDiagnosisHistoryList,
	getDiagnosisSupport,
	startDiagnosis
} from "@/api/modules";
import DiagnosisDetailModal, {
	DiagnosisDetailModalRef
} from "@/components/Modal/DiagnosisDetailModal";
import { DeleteOutlined, ReloadOutlined, SearchOutlined, SelectOutlined } from "@ant-design/icons";
import {
	Button,
	Input,
	message,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography
} from "antd";
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
	const [searchText, setSearchText] = useState("");
	const [serviceList, setServiceList] = useState<AiService[]>([]);
	const [selectedServiceId, setSelectedServiceId] = useState<number>();
	const [selectedRecord, setSelectedRecord] = useState<DiagnosisHistory | null>(null);
	const modalRef = useRef<DiagnosisDetailModalRef>(null);

	// 获取诊断支持信息
	const fetchDiagnosisSupport = async () => {
		try {
			const response = await getDiagnosisSupport();
			if (response.code === 200 && response.data) {
				setServiceList(response.data);
				// 默认使用第一个服务
				if (response.data.length > 0) {
					setSelectedServiceId(response.data[0].serviceId);
				}
			}
		} catch (error) {
			console.error("获取诊断支持信息失败", error);
		}
	};

	useEffect(() => {
		fetchDiagnosisSupport();
	}, []);

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

	// 重新诊断
	const handleReDiagnose = async (record: DiagnosisHistory) => {
		if (!selectedServiceId) return;

		try {
			await startDiagnosis({
				diagnosisId: record.id,
				serviceId: selectedServiceId
			});
			message.success("重新诊断已开始");
			fetchDiagnosisHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("重新诊断失败", error);
			message.error("重新诊断失败");
		}
	};

	// 处理服务选择确认
	const handleServiceSelectOk = async () => {
		if (!selectedRecord) return;
		await handleReDiagnose(selectedRecord);
		setSelectedRecord(null);
	};

	// 表格列定义
	const columns: ColumnsType<DiagnosisHistory> = [
		{
			title: "诊断时间",
			dataIndex: "createdAt",
			width: 180,
			render: (text: string) => (
				<Text className="text-gray-600">{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</Text>
			)
		},
		{
			title: "状态",
			dataIndex: "status",
			width: 100,
			render: (status: string) => (
				<Tag
					color={status === "completed" ? "success" : "processing"}
					className="px-3 py-1 rounded-full"
				>
					{status === "completed" ? "已完成" : "处理中"}
				</Tag>
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
								<Text key={index} className="text-gray-700">
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
			width: 180,
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						onClick={() => handleViewDetail(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						查看
					</Button>
					<Popconfirm
						title="选择诊断服务"
						description={
							<div className="py-2">
								<Select
									value={selectedServiceId}
									onChange={value => setSelectedServiceId(value)}
									className="w-full"
									options={serviceList.map(service => ({
										label: service.serviceName,
										value: service.serviceId
									}))}
								/>
							</div>
						}
						onConfirm={handleServiceSelectOk}
						okText="确定"
						cancelText="取消"
					>
						<Button
							type="link"
							icon={<ReloadOutlined />}
							onClick={() => setSelectedRecord(record)}
							className="text-green-500 hover:text-green-600"
						>
							重新诊断
						</Button>
					</Popconfirm>
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

	// 过滤数据
	const filteredData = data.filter(item => {
		const searchLower = searchText.toLowerCase();
		return (
			item.diagnosisResult?.predictions.some(prediction =>
				prediction.class_name.toLowerCase().includes(searchLower)
			) || dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss").includes(searchLower)
		);
	});

	useEffect(() => {
		fetchDiagnosisHistory();
	}, []);

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50"
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
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">诊断历史</h2>
						<p className="text-gray-500">共 {pagination.total} 条记录</p>
					</div>
					<div className="flex items-center gap-4">
						<Input
							placeholder="搜索诊断记录..."
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
							type={isSelectMode ? "primary" : "default"}
							icon={<SelectOutlined />}
							onClick={toggleSelectMode}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2",
								isSelectMode && "bg-blue-500 hover:bg-blue-600 border-none"
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
									className={clsx(
										"px-6 h-10",
										"rounded-lg",
										"shadow-sm hover:shadow-md",
										"transition-all duration-300",
										"flex items-center gap-2"
									)}
								>
									批量删除
								</Button>
							</Popconfirm>
						)}
					</div>
				</div>
				{isSelectMode && (
					<div className="flex items-center gap-2">
						<Tag color="blue" className="px-3 py-1 rounded-full">
							已选择 {selectedRowKeys.length} 条记录
						</Tag>
					</div>
				)}
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
					dataSource={filteredData}
					rowKey="id"
					pagination={{
						...pagination,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`,
						className: "mt-4"
					}}
					loading={loading}
					onChange={handleTableChange}
					scroll={{ x: 1000 }}
					className={clsx("transition-all duration-300", isSelectMode && "bg-gray-50")}
				/>
			</div>
			<DiagnosisDetailModal ref={modalRef} />
		</div>
	);
};

export default DiagnosisHistoryPage;
