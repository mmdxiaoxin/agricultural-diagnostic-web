import { Crop, Disease, ReqDiseaseList } from "@/api/interface/knowledge";
import { getCrops } from "@/api/modules/Knowledge";
import { deleteKnowledge, getKnowledgeList } from "@/api/modules/Knowledge/knowledge";
import DiseaseModal, { DiseaseModalRef } from "@/components/Modal/DiseaseModal";
import PageHeader from "@/components/PageHeader";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	message,
	Popconfirm,
	Select,
	Space,
	Table,
	TableColumnType,
	Tag,
	Tooltip
} from "antd";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const { Option } = Select;

const DiseaseManage: React.FC = () => {
	const navigate = useNavigate();
	const diseaseModalRef = useRef<DiseaseModalRef>(null);
	const [diseases, setDiseases] = useState<Disease[]>([]);
	const [crops, setCrops] = useState<Crop[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [params, setParams] = useState<ReqDiseaseList>({
		page: 1,
		pageSize: 10,
		keyword: "",
		cropId: undefined
	});

	const fetchDiseaseList = async (params: ReqDiseaseList) => {
		setLoading(true);
		try {
			const res = await getKnowledgeList(params);
			setDiseases(res.data?.list || []);
			setTotal(res.data?.total || 0);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCrops = async () => {
		const res = await getCrops();
		setCrops(res.data || []);
	};

	useEffect(() => {
		Promise.allSettled([fetchDiseaseList(params), fetchCrops()]);
	}, []);

	const handleAddDisease = () => {
		diseaseModalRef.current?.open("add", undefined, crops);
	};

	const handleEditDisease = (record: Disease) => {
		diseaseModalRef.current?.open("edit", record, crops);
	};

	const handleDeleteDisease = async (record: Disease) => {
		try {
			await deleteKnowledge(record.id);
			message.success("删除成功");
			fetchDiseaseList(params);
		} catch (error) {
			console.error(error);
			message.error("删除失败");
		}
	};

	const handlePreviewDisease = (record: Disease) => {
		navigate(`/knowledge/preview?id=${record.id}`);
	};

	const handleSearch = (value: string) => {
		const newParams = { ...params, keyword: value, page: 1 };
		setParams(newParams);
		fetchDiseaseList(newParams);
	};

	const handleCropChange = (value: number) => {
		const newParams = { ...params, cropId: value === 0 ? undefined : value, page: 1 };
		setParams(newParams);
		fetchDiseaseList(newParams);
	};

	const columns: TableColumnType<Disease>[] = [
		{
			title: "病害名称",
			dataIndex: "name",
			key: "name",
			render: text => <span className="font-medium">{text}</span>
		},
		{
			title: "别名",
			dataIndex: "alias",
			key: "alias"
		},
		{
			title: "作物",
			dataIndex: ["crop", "name"],
			key: "crop",
			render: text => <Tag color="blue">{text}</Tag>
		},
		{
			title: "病因",
			dataIndex: "cause",
			key: "cause",
			ellipsis: true
		},
		{
			title: "传播方式",
			dataIndex: "transmission",
			key: "transmission",
			ellipsis: true
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record) => (
				<Space size="middle">
					<Tooltip title="预览">
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => handlePreviewDisease(record)}
						/>
					</Tooltip>
					<Tooltip title="编辑">
						<Button type="link" icon={<EditOutlined />} onClick={() => handleEditDisease(record)} />
					</Tooltip>
					<Popconfirm
						title="确定删除该病害吗？"
						onConfirm={() => handleDeleteDisease(record)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="link" icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			)
		}
	];

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
				title="病害管理"
				search={{
					placeholder: "搜索病害名称",
					value: params.keyword,
					onChange: value => {
						setParams(prev => ({ ...prev, keyword: value }));
					},
					onSearch: handleSearch
				}}
				statistics={{
					label: "共",
					value: `${diseases.length} 个病害`
				}}
				actionButton={{
					text: "添加病害",
					icon: <PlusOutlined />,
					onClick: handleAddDisease
				}}
				extra={
					<Select defaultValue={0} style={{ width: 120 }} onChange={handleCropChange}>
						<Option value={0}>全部作物</Option>
						{crops.map(crop => (
							<Option key={crop.id} value={crop.id}>
								{crop.name}
							</Option>
						))}
					</Select>
				}
			/>

			<Card>
				<Table<Disease>
					columns={columns}
					dataSource={diseases}
					loading={loading}
					rowKey="id"
					pagination={{
						total,
						pageSize: params.pageSize,
						current: params.page,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`,
						onChange: (page, pageSize) => {
							const newParams = { ...params, page, pageSize };
							setParams(newParams);
							fetchDiseaseList(newParams);
						}
					}}
				/>
			</Card>
			<DiseaseModal ref={diseaseModalRef} onFinish={() => fetchDiseaseList(params)} />
		</div>
	);
};

export default DiseaseManage;
