import { Disease } from "@/api/interface/knowledge";
import KnowledgeModal, { KnowledgeModalRef } from "@/components/Modal/KnowledgeModel";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tag } from "antd";
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
					<Button type="link" icon={<EditOutlined />}>
						编辑
					</Button>
					<Button type="link" danger icon={<DeleteOutlined />}>
						删除
					</Button>
				</Space>
			)
		}
	];

	return (
		<div className={clsx("p-6 min-h-screen bg-gray-100")}>
			<Card className="mb-6">
				<div className="flex justify-between items-center">
					<div className="flex space-x-4">
						<Search
							placeholder="搜索病害名称"
							allowClear
							onSearch={value => setSearchText(value)}
							className="w-64"
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
			</Card>

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
						showQuickJumper: true
					}}
				/>
			</Card>
			<KnowledgeModal ref={knowledgeModalRef} />
		</div>
	);
};

export default KnowledgeManage;
