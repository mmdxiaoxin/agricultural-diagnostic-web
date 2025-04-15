import { ReqPage } from "@/api/interface";
import { Crop, Disease, ReqDiseaseList } from "@/api/interface/knowledge";
import { getCrops } from "@/api/modules/Knowledge";
import { deleteKnowledge, getKnowledgeList } from "@/api/modules/Knowledge/knowledge";
import DiseaseModal, { DiseaseModalRef } from "@/components/Modal/DiseaseModal";
import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	PlusOutlined,
	SearchOutlined
} from "@ant-design/icons";
import {
	Button,
	Card,
	Input,
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

const { Search } = Input;
const { Option } = Select;

const DiseaseManage: React.FC = () => {
	const navigate = useNavigate();
	const diseaseModalRef = useRef<DiseaseModalRef>(null);
	const [diseases, setDiseases] = useState<Disease[]>([]);
	const [crops, setCrops] = useState<Crop[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [params, setParams] = useState<ReqPage>({
		page: 1,
		pageSize: 10
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
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold text-gray-800">病害管理</h2>
						<p className="text-gray-500">共 {diseases.length} 个病害</p>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex space-x-4">
							<Search
								placeholder="搜索病害名称"
								allowClear
								onSearch={value => fetchDiseaseList({ ...params, keyword: value })}
								className="w-64"
								prefix={<SearchOutlined />}
							/>
							<Select
								defaultValue={0}
								style={{ width: 120 }}
								onChange={value =>
									fetchDiseaseList({ ...params, cropId: value === 0 ? undefined : value })
								}
							>
								<Option value={0}>全部作物</Option>
								{crops.map(crop => (
									<Option key={crop.id} value={crop.id}>
										{crop.name}
									</Option>
								))}
							</Select>
						</div>
						<Button type="primary" icon={<PlusOutlined />} onClick={handleAddDisease}>
							添加病害
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<Table<Disease>
					columns={columns}
					dataSource={diseases}
					loading={loading}
					rowKey="id"
					pagination={{
						total,
						pageSize: params.pageSize,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`,
						onChange: (page, pageSize) => {
							setParams({ ...params, page, pageSize });
							fetchDiseaseList({ ...params, page, pageSize });
						}
					}}
				/>
			</Card>
			<DiseaseModal ref={diseaseModalRef} onFinish={() => fetchDiseaseList(params)} />
		</div>
	);
};

export default DiseaseManage;
