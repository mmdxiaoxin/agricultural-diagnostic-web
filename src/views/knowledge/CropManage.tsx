import { Crop } from "@/api/interface/knowledge/crop"; // 假设您有一个 Crop 类型
import { deleteCrop, getCropsList } from "@/api/modules/Knowledge";
import CropModal, { CropModalRef } from "@/components/Modal/CropModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, message, Modal, Space, Table, Tooltip } from "antd";
import { ColumnType } from "antd/es/table";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

interface QueryParams {
	page: number;
	pageSize: number;
	keyword?: string;
}

const CropManage: React.FC = () => {
	const [crops, setCrops] = useState<Crop[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [params, setParams] = useState<QueryParams>({
		page: 1,
		pageSize: 10,
		keyword: ""
	});

	const cropModalRef = useRef<CropModalRef>(null);

	const fetchCrops = async (params: QueryParams) => {
		setLoading(true);
		try {
			const res = await getCropsList({
				page: params.page,
				pageSize: params.pageSize,
				keyword: params.keyword
			});
			if (!res.data) return;
			setCrops(res?.data.list || []);
			setTotal(res?.data.total || 0);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (value: string) => {
		const newParams = { ...params, keyword: value, page: 1 };
		setParams(newParams);
		fetchCrops(newParams);
	};

	const handleTableChange = (pagination: any) => {
		const newParams = { ...params, page: pagination.current, pageSize: pagination.pageSize };
		setParams(newParams);
		fetchCrops(newParams);
	};

	useEffect(() => {
		fetchCrops(params);
	}, [params.page, params.pageSize]);

	const handleAddCrop = () => {
		cropModalRef.current?.open("add");
	};

	const handleEditCrop = (crop: Crop) => {
		cropModalRef.current?.open("edit", crop);
	};

	const handleDeleteCrop = (crop: Crop) => {
		Modal.confirm({
			title: "删除作物",
			content: `确定删除作物 ${crop.name} 吗？`,
			onOk: async () => {
				await deleteCrop(crop.id);
				message.success("删除成功");
				fetchCrops(params);
			}
		});
	};

	const columns: ColumnType<Crop>[] = [
		{
			title: "作物名称",
			dataIndex: "name",
			key: "name",
			render: text => <TextCell className="font-medium" text={text} />,
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "学名",
			dataIndex: "scientificName",
			key: "scientificName",
			render: text => <TextCell text={text} />,
			responsive: ["sm", "md", "lg", "xl", "xxl"]
		},
		{
			title: "作物类型",
			dataIndex: "cropType",
			key: "cropType",
			render: text => <TextCell text={text} />,
			responsive: ["md", "lg", "xl", "xxl"]
		},
		{
			title: "生长周期",
			dataIndex: "growthCycle",
			key: "growthCycle",
			render: text => <TextCell text={text} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "适宜种植区域",
			dataIndex: "suitableArea",
			key: "suitableArea",
			render: text => <TextCell text={text} />,
			responsive: ["lg", "xl", "xxl"]
		},
		{
			title: "操作",
			key: "action",
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
			render: (_: string, record) => (
				<Space wrap className="flex flex-col sm:flex-row">
					<Tooltip title="编辑">
						<Button type="link" icon={<EditOutlined />} onClick={() => handleEditCrop(record)} />
					</Tooltip>
					<Tooltip title="删除">
						<Button
							type="link"
							danger
							icon={<DeleteOutlined />}
							onClick={() => handleDeleteCrop(record)}
						/>
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
			<PageHeader
				title="作物管理"
				search={{
					placeholder: "搜索关键词",
					value: params.keyword,
					onChange: value => {
						setParams(prev => ({ ...prev, keyword: value }));
					},
					onSearch: handleSearch
				}}
				statistics={{
					label: "共",
					value: `${crops.length} 个作物`
				}}
				actionButton={{
					text: "添加作物",
					icon: <PlusOutlined />,
					onClick: handleAddCrop
				}}
			/>

			<Card>
				<Table
					columns={columns}
					dataSource={crops}
					loading={loading}
					rowKey="id"
					scroll={{ x: "max-content" }}
					pagination={{
						current: params.page,
						pageSize: params.pageSize,
						total: total,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`
					}}
					onChange={handleTableChange}
				/>
			</Card>
			<CropModal ref={cropModalRef} onSubmit={() => fetchCrops(params)} />
		</div>
	);
};

export default CropManage;
