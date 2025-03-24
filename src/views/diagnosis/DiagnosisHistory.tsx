import { DiagnosisHistory } from "@/api/interface/diagnosis";
import { deleteDiagnosisHistory, getDiagnosisHistoryList } from "@/api/modules";
import DiagnosisDetailModal, {
	DiagnosisDetailModalRef
} from "@/components/Modal/DiagnosisDetailModal";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
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
				return (
					<Space direction="vertical" size={0}>
						{predictions.map((prediction, index) => (
							<Text key={index}>
								{prediction.type === "classify" ? "分类" : "检测"}: {prediction.class_name} (
								{(prediction.confidence * 100).toFixed(2)}%)
							</Text>
						))}
					</Space>
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

	useEffect(() => {
		fetchDiagnosisHistory();
	}, []);

	return (
		<div title="诊断历史" className={clsx("h-full", "bg-white rounded-lg overflow-y-auto")}>
			<Table
				columns={columns}
				dataSource={data}
				rowKey="id"
				pagination={pagination}
				loading={loading}
				onChange={handleTableChange}
				scroll={{ x: 1000 }}
			/>
			<DiagnosisDetailModal ref={modalRef} />
		</div>
	);
};

export default DiagnosisHistoryPage;
