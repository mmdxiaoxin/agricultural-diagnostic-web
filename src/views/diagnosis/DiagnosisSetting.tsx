import { DiagnosisSupport } from "@/api/interface/diagnosis";
import { RemoteService } from "@/api/interface/service";
import { deleteDiagnosisSupport, getDiagnosisSupport } from "@/api/modules/diagnosis";
import { getRemotes } from "@/api/modules/service";
import DiagnosisSupportModal, {
	DiagnosisSupportModalRef
} from "@/components/Modal/DiagnosisSupportModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Space, Table, TableColumnType, Tooltip } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";

const DiagnosisSetting: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [diagnosisSupports, setDiagnosisSupports] = useState<DiagnosisSupport[]>([]);
	const [serviceList, setServiceList] = useState<RemoteService[]>([]);
	const modalRef = useRef<DiagnosisSupportModalRef>(null);

	// 获取服务列表
	const fetchServices = async () => {
		try {
			const res = await getRemotes();
			if (res.code === 200) {
				setServiceList(res.data || []);
			}
		} catch (error: any) {
			message.error("获取服务列表失败: " + error.message);
		}
	};

	// 获取诊断支持列表
	const fetchDiagnosisSupports = async () => {
		setLoading(true);
		try {
			const res = await getDiagnosisSupport();
			if (res.code === 200) {
				setDiagnosisSupports(res.data || []);
			}
		} catch (error: any) {
			message.error("获取诊断支持列表失败: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	// 处理添加诊断支持
	const handleAddSupport = () => {
		modalRef.current?.open("add");
	};

	// 处理编辑诊断支持
	const handleEditSupport = (record: DiagnosisSupport) => {
		modalRef.current?.open("edit", record);
	};

	// 处理删除诊断支持
	const handleDeleteSupport = async (id: number) => {
		try {
			await deleteDiagnosisSupport(id);
			message.success("删除成功");
			fetchDiagnosisSupports();
		} catch (error: any) {
			message.error("删除失败: " + error.message);
		}
	};

	// 表格列定义
	const columns: TableColumnType<DiagnosisSupport>[] = [
		{
			title: "配置名称",
			dataIndex: "key",
			key: "key",
			render: (text: string) => <TextCell text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			render: (text: string) => <TextCell text={text || "-"} />,
			responsive: ["md", "lg", "xl", "xxl"]
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: (text: string) => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record) => (
				<Space size="middle">
					<Tooltip title="编辑">
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => handleEditSupport(record)}
							className="text-blue-500 hover:text-blue-600"
						/>
					</Tooltip>
					<Popconfirm
						title="确定删除该配置吗？"
						description="删除后将无法恢复"
						onConfirm={() => handleDeleteSupport(record.id)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="link" icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
			fixed: "right"
		}
	];

	useEffect(() => {
		fetchServices();
		fetchDiagnosisSupports();
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
				title="诊断配置"
				description="管理诊断支持配置信息"
				statistics={{
					label: "共",
					value: `${diagnosisSupports.length} 个配置`
				}}
				actionButton={{
					text: "添加配置",
					icon: <PlusOutlined />,
					onClick: handleAddSupport
				}}
			/>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
				<Table<DiagnosisSupport>
					loading={loading}
					columns={columns}
					dataSource={diagnosisSupports}
					rowKey="id"
					scroll={{ x: "max-content" }}
					className="transition-all duration-300"
				/>
			</div>

			<DiagnosisSupportModal
				ref={modalRef}
				serviceList={serviceList}
				onSave={() => {
					fetchDiagnosisSupports();
				}}
			/>
		</div>
	);
};

export default DiagnosisSetting;
