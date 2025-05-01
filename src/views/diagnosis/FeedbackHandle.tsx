import { DiagnosisFeedback } from "@/api/interface/diagnosis";
import { getDiagnosisFeedbackListForAdmin } from "@/api/modules/diagnosis";
import FeedbackDetailModal, {
	FeedbackDetailModalRef
} from "@/components/Modal/FeedbackDetailModal";
import FeedbackHandleModal, {
	FeedbackHandleModalRef
} from "@/components/Modal/FeedbackHandleModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { FEEDBACK_STATUS_COLOR, FEEDBACK_STATUS_TEXT } from "@/constants/status";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";

const FeedbackHandle: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DiagnosisFeedback[]>([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const detailModalRef = useRef<FeedbackDetailModalRef>(null);
	const handleModalRef = useRef<FeedbackHandleModalRef>(null);

	// 获取反馈处理列表
	const fetchFeedbackHistory = async (
		page: number = 1,
		pageSize: number = 10,
		status: string = "pending"
	) => {
		setLoading(true);
		try {
			const response = await getDiagnosisFeedbackListForAdmin({
				page,
				pageSize,
				status
			});
			if (response.code === 200 && response.data) {
				setData(response.data.list);
				setPagination({
					current: page,
					pageSize,
					total: response.data.total
				});
			}
		} catch (error) {
			console.error("获取反馈处理失败", error);
			message.error("获取反馈处理失败");
		} finally {
			setLoading(false);
		}
	};

	// 查看详情
	const handleViewDetail = (record: DiagnosisFeedback) => {
		detailModalRef.current?.open(record);
	};

	// 处理反馈
	const handleFeedback = (record: DiagnosisFeedback) => {
		handleModalRef.current?.open(record);
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
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => handleFeedback(record)}
						className="text-green-500 hover:text-green-600"
					>
						处理
					</Button>
				</Space>
			)
		}
	];

	// 表格变化处理
	const handleTableChange = (newPagination: any) => {
		fetchFeedbackHistory(newPagination.current, newPagination.pageSize);
	};

	// 状态变化
	const handleStatusChange = (value: string) => {
		fetchFeedbackHistory(pagination.current, pagination.pageSize, value);
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
				title="反馈处理"
				description={`共 ${pagination.total} 条记录`}
				extra={
					<Select
						defaultValue={"pending"}
						style={{ width: 120, height: 36 }}
						onChange={handleStatusChange}
					>
						{Object.entries(FEEDBACK_STATUS_TEXT).map(([key, value]) => (
							<Select.Option key={key} value={key}>
								{value}
							</Select.Option>
						))}
					</Select>
				}
			/>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
				<Table
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
				/>
			</div>

			<FeedbackDetailModal ref={detailModalRef} />
			<FeedbackHandleModal ref={handleModalRef} onSuccess={() => fetchFeedbackHistory()} />
		</div>
	);
};

export default FeedbackHandle;
