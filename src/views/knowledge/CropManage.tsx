import { Crop } from "@/api/interface/knowledge/crop"; // 假设您有一个 Crop 类型
import CropModal, { CropModalRef } from "@/components/Modal/CropModal";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table, Tooltip } from "antd";
import clsx from "clsx";
import React, { useRef, useState } from "react";

const { Search } = Input;
const { Option } = Select;

const CropManage: React.FC = () => {
	const [crops, setCrops] = useState<Crop[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");

	const cropModalRef = useRef<CropModalRef>(null);

	const handleAddCrop = () => {
		cropModalRef.current?.open("add");
	};

	const columns = [
		{
			title: "作物名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <span className="font-medium">{text}</span>
		},
		{
			title: "学名",
			dataIndex: "scientificName",
			key: "scientificName"
		},
		{
			title: "生长阶段",
			dataIndex: "growthStage",
			key: "growthStage"
		},
		{
			title: "操作",
			key: "action",
			render: (_: any, record: Crop) => (
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
						<h2 className="text-2xl font-semibold text-gray-800">作物管理</h2>
						<p className="text-gray-500">共 {crops.length} 个作物</p>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex space-x-4">
							<Search
								placeholder="搜索作物名称"
								allowClear
								onSearch={value => setSearchText(value)}
								className="w-64"
								prefix={<SearchOutlined />}
							/>
						</div>
						<Button type="primary" icon={<PlusOutlined />} onClick={handleAddCrop}>
							添加作物
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<Table
					columns={columns}
					dataSource={crops}
					loading={loading}
					rowKey="id"
					pagination={{
						total: crops.length,
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`
					}}
				/>
			</Card>
			<CropModal ref={cropModalRef} />
		</div>
	);
};

export default CropManage;
