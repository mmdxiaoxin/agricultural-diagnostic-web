import { DiagnosisHistory, DiagnosisSupport } from "@/api/interface/diagnosis";
import { RemoteService } from "@/api/interface/service";
import {
	deleteDiagnosisHistories,
	deleteDiagnosisHistory,
	getDiagnosisHistoryList,
	getDiagnosisSupport,
	getRemotes,
	startDiagnosis
} from "@/api/modules";
import DiagnosisDetailModal, {
	DiagnosisDetailModalRef
} from "@/components/Modal/DiagnosisDetailModal";
import FeedbackSubmitModal, {
	DiagnosisFeedbackModalRef
} from "@/components/Modal/FeedbackSubmitModal";
import PageHeader from "@/components/PageHeader";
import ServiceCascader from "@/components/ServiceCascader";
import TextCell from "@/components/Table/TextCell";
import { DIAGNOSIS_CLASS_NAME_ZH_CN } from "@/constants/diagnosis";
import { DIAGNOSIS_STATUS_COLOR, DIAGNOSIS_STATUS_TEXT } from "@/constants/status";
import { useAppSelector } from "@/hooks";
import { DeleteOutlined, EyeOutlined, MessageOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
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
	const [serviceList, setServiceList] = useState<RemoteService[]>([]);
	const [selectedServiceId, setSelectedServiceId] = useState<number>();
	const [selectedConfigId, setSelectedConfigId] = useState<number>();
	const [selectedRecord, setSelectedRecord] = useState<DiagnosisHistory | null>(null);
	const [supportList, setSupportList] = useState<DiagnosisSupport[]>([]);
	const detailModalRef = useRef<DiagnosisDetailModalRef>(null);
	const feedbackModalRef = useRef<DiagnosisFeedbackModalRef>(null);
	const { user } = useAppSelector(state => state.user);
	const isAdminOrExpert = user.roles?.some(role => role.name === "admin" || role.name === "expert");

	// 获取服务列表
	const fetchService = async () => {
		try {
			const response = await getRemotes();
			if (response.code === 200 && response.data) {
				setServiceList(response.data);
				// 默认使用第一个服务和配置
				if (response.data.length > 0) {
					setSelectedServiceId(response.data[0].id);
					if (response.data[0].configs.length > 0) {
						setSelectedConfigId(response.data[0].configs[0].id);
					}
				}
			}
		} catch (error) {
			console.error("获取服务列表失败", error);
		}
	};

	const fetchSupportList = async () => {
		try {
			const res = await getDiagnosisSupport();
			if (res.code !== 200 && res.code !== 201) throw new Error("获取诊断支持列表失败，请重试！");
			if (!res.data) throw new Error("获取诊断支持列表失败，请重试！");
			setSupportList(res.data);
		} catch (error) {
			console.error("获取诊断支持列表失败", error);
		}
	};

	useEffect(() => {
		if (isAdminOrExpert) {
			fetchService();
		} else {
			fetchSupportList();
		}
	}, [isAdminOrExpert]);

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
		detailModalRef.current?.open(record);
	};

	// 重新诊断
	const handleReDiagnose = async (record: DiagnosisHistory) => {
		if (!selectedServiceId || !selectedConfigId) return;

		try {
			await startDiagnosis({
				diagnosisId: record.id,
				serviceId: selectedServiceId,
				configId: selectedConfigId
			});
			message.success("诊断成功");
			fetchDiagnosisHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("重新诊断失败", error);
			message.error("重新诊断失败");
		}
	};

	// 处理级联选择器的变化
	const handleServiceChange = (value: [number, number] | undefined) => {
		if (value) {
			setSelectedServiceId(value[0]);
			setSelectedConfigId(value[1]);
		} else {
			setSelectedServiceId(undefined);
			setSelectedConfigId(undefined);
		}
	};

	// 处理 Select 选择器的变化
	const handleSupportChange = (value: string) => {
		const support = supportList.find(item => item.key === value);
		if (support) {
			setSelectedServiceId(support.value.serviceId);
			setSelectedConfigId(support.value.configId);
		} else {
			setSelectedServiceId(undefined);
			setSelectedConfigId(undefined);
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
			title: "创建时间",
			dataIndex: "createdAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "最近诊断",
			dataIndex: "updatedAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "状态",
			dataIndex: "status",
			render: (status: DiagnosisHistory["status"]) => (
				<Tag color={DIAGNOSIS_STATUS_COLOR[status]} className="px-3 py-1 rounded-full">
					{DIAGNOSIS_STATUS_TEXT[status]}
				</Tag>
			),
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "诊断结果",
			dataIndex: "diagnosisResult",
			render: (diagnosisResult: DiagnosisHistory["diagnosisResult"]) => {
				if (!diagnosisResult) return <Text type="secondary">无结果</Text>;
				const predictions = diagnosisResult.predictions;

				// 生成完整的结果文本
				const fullResult = (predictions || []).map(
					prediction =>
						`${prediction.type === "classify" ? "分类" : "检测"}: ${
							DIAGNOSIS_CLASS_NAME_ZH_CN[
								prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
							] || prediction.class_name
						} (${(prediction.confidence * 100).toFixed(2)}%)`
				);
				const displayPredictions = (predictions || []).slice(0, 2);
				const hasMore = (predictions || []).length > 2;

				return (
					<Tooltip title={hasMore ? fullResult.join("\n") : null}>
						<Space direction="vertical" size={0}>
							{displayPredictions.map((prediction, index) => (
								<Text key={index} className="text-gray-700">
									{prediction.type === "classify" ? "分类" : "检测"}:
									{DIAGNOSIS_CLASS_NAME_ZH_CN[
										prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
									] || prediction.class_name}
									({(prediction.confidence * 100).toFixed(2)}%)
								</Text>
							))}
							{hasMore && (
								<Text type="secondary" className="text-xs">
									等 {(predictions || []).length} 个结果...
								</Text>
							)}
						</Space>
					</Tooltip>
				);
			},
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			render: (_, record) => (
				<Space wrap className="flex-col lg:flex-row">
					<Button
						icon={<EyeOutlined />}
						type="link"
						onClick={() => handleViewDetail(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						查看
					</Button>
					<Button
						icon={<MessageOutlined />}
						type="link"
						onClick={() => feedbackModalRef.current?.open(record.id)}
						className="text-blue-500 hover:text-blue-600"
					>
						反馈
					</Button>
					<Popconfirm
						title={isAdminOrExpert ? "选择诊断服务" : "选择诊断支持"}
						description={
							<div className="py-2">
								{isAdminOrExpert ? (
									<ServiceCascader
										serviceList={serviceList}
										value={
											selectedServiceId && selectedConfigId
												? [selectedServiceId, selectedConfigId]
												: undefined
										}
										onChange={handleServiceChange}
									/>
								) : (
									<Select
										placeholder="请选择诊断支持"
										className="w-full min-w-40"
										onChange={handleSupportChange}
										value={
											supportList.find(
												item =>
													item.value.serviceId === selectedServiceId &&
													item.value.configId === selectedConfigId
											)?.key
										}
									>
										{supportList.map(item => (
											<Select.Option key={item.key} value={item.key}>
												{item.key}
											</Select.Option>
										))}
									</Select>
								)}
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
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<PageHeader
				title="诊断历史"
				description={`共 ${pagination.total} 条记录`}
				selectMode={{
					enabled: isSelectMode,
					selectedCount: selectedRowKeys.length,
					onToggle: toggleSelectMode,
					onBatchDelete: handleBatchDelete
				}}
			/>

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
					dataSource={data}
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
					scroll={{ x: "max-content" }}
					className={clsx("transition-all duration-300", isSelectMode && "bg-gray-50")}
				/>
			</div>
			<DiagnosisDetailModal ref={detailModalRef} />
			<FeedbackSubmitModal ref={feedbackModalRef} />
		</div>
	);
};

export default DiagnosisHistoryPage;
