import { Disease } from "@/api/interface/knowledge";
import KnowledgeModal, { KnowledgeModalRef } from "@/components/Modal/KnowledgeModel";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import clsx from "clsx";
import React, { useRef, useState } from "react";

const { Search } = Input;
const { Option } = Select;

const KnowledgeManage: React.FC = () => {
	const knowledgeModalRef = useRef<KnowledgeModalRef>(null);
	const [diseases, setDiseases] = useState<Disease[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [selectedCrop, setSelectedCrop] = useState<string>("all");

	const handleAddDisease = () => {
		knowledgeModalRef.current?.open("add");
	};

	const columns = [
		{
			title: "病害名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <span className="font-medium">{text}</span>
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
			render: (text: string) => <Tag color="blue">{text}</Tag>
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
			render: (_: any, record: Disease) => (
				<Space size="middle">
					<Tooltip title="编辑">
						<Button type="link" icon={<EditOutlined />} />
					</Tooltip>
					<Tooltip title="删除">
						<Button type="link" danger icon={<DeleteOutlined />} />
					</Tooltip>
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
						<h2 className="text-2xl font-semibold text-gray-800">病害知识库管理</h2>
						<p className="text-gray-500">共 {diseases.length} 个病害</p>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex space-x-4">
							<Search
								placeholder="搜索病害名称"
								allowClear
								onSearch={value => setSearchText(value)}
								className="w-64"
								prefix={<SearchOutlined />}
							/>
							<Select
								defaultValue="all"
								style={{ width: 120 }}
								onChange={value => setSelectedCrop(value)}
							>
								<Option value="all">全部作物</Option>
								<Option value="rice">水稻</Option>
								<Option value="wheat">小麦</Option>
								<Option value="corn">玉米</Option>
							</Select>
						</div>
						<Button type="primary" icon={<PlusOutlined />} onClick={handleAddDisease}>
							添加病害
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<Table
					columns={columns}
					dataSource={diseases}
					loading={loading}
					rowKey="id"
					pagination={{
						total: diseases.length,
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`
					}}
				/>
			</Card>
			<KnowledgeModal ref={knowledgeModalRef} />
		</div>
	);
};

export default KnowledgeManage;
