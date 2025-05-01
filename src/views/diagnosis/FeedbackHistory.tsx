import { DiagnosisFeedback } from "@/api/interface/diagnosis";
import { deleteDiagnosisFeedback, getDiagnosisFeedbackList } from "@/api/modules/diagnosis";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { FEEDBACK_STATUS_COLOR, FEEDBACK_STATUS_TEXT } from "@/constants/status";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

const FeedbackHistory: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DiagnosisFeedback[]>([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isSelectMode, setIsSelectMode] = useState(false);

	// 获取反馈历史列表
	const fetchFeedbackHistory = async (page: number = 1, pageSize: number = 10) => {
		setLoading(true);
		try {
			const response = await getDiagnosisFeedbackList({ page, pageSize });
			if (response.code === 200 && response.data) {
				setData(response.data.list);
				setPagination({
					current: page,
					pageSize,
					total: response.data.total
				});
			}
		} catch (error) {
			console.error("获取反馈历史失败", error);
			message.error("获取反馈历史失败");
		} finally {
			setLoading(false);
		}
	};

	// 删除反馈
	const handleDelete = async (id: number) => {
		try {
			await deleteDiagnosisFeedback(id);
			message.success("删除成功");
			fetchFeedbackHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("删除失败", error);
			message.error("删除失败");
		}
	};

	// 批量删除
	const handleBatchDelete = async () => {
		try {
			await Promise.all(selectedRowKeys.map(id => deleteDiagnosisFeedback(id as number)));
			message.success("批量删除成功");
			setSelectedRowKeys([]);
			setIsSelectMode(false);
			fetchFeedbackHistory(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("批量删除失败", error);
			message.error("批量删除失败");
		}
	};

	// 查看详情
	const handleViewDetail = (record: DiagnosisFeedback) => {
		// TODO: 实现查看详情功能
		console.log("查看详情", record);
	};

	// 表格列定义
	const columns: ColumnsType<DiagnosisFeedback> = [
		{
			title: "创建时间",
			dataIndex: "createdAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "状态",
			dataIndex: "status",
			render: (status: DiagnosisFeedback["status"]) => (
				<Tag color={FEEDBACK_STATUS_COLOR[status]} className="px-3 py-1 rounded-full">
					{FEEDBACK_STATUS_TEXT[status]}
				</Tag>
			),
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "反馈内容",
			dataIndex: "feedbackContent",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "专家评论",
			dataIndex: "expertComment",
			render: (text: string) => <TextCell text={text || "暂无评论"} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space wrap className="flex-col lg:flex-row">
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => handleViewDetail(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						查看
					</Button>
					<Popconfirm
						title="确定要删除这条反馈记录吗？"
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
		fetchFeedbackHistory(newPagination.current, newPagination.pageSize);
	};

	// 选择模式切换
	const toggleSelectMode = () => {
		setIsSelectMode(!isSelectMode);
		setSelectedRowKeys([]);
	};

	useEffect(() => {
		fetchFeedbackHistory();
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
				title="反馈历史"
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
		</div>
	);
};

export default FeedbackHistory;
