import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
	Card,
	Table,
	Button,
	Form,
	Input,
	InputNumber,
	Switch,
	Select,
	Space,
	Modal,
	message,
	Typography,
	Tag,
	Tooltip
} from "antd";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	UploadOutlined,
	SearchOutlined
} from "@ant-design/icons";
import clsx from "clsx";
import type { ModelConfig, ModelParameter } from "@/typings/model";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import ModelManageModal, { ModelManageModalRef } from "@/components/Modal/ModelManageModal";

const { Text } = Typography;

const ModelsManage = () => {
	const [models, setModels] = useState<ModelConfig[]>([]);
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const modalRef = useRef<ModelManageModalRef>(null);

	const columns: ColumnsType<ModelConfig> = [
		{
			title: "模型名称",
			dataIndex: "name",
			key: "name",
			render: (text: string) => <Text className="text-gray-800 font-medium">{text}</Text>
		},
		{
			title: "类型",
			dataIndex: "type",
			key: "type",
			render: (type: string) => (
				<Tag
					color={type === "yolo" ? "blue" : type === "resnet" ? "green" : "purple"}
					className="px-3 py-1 rounded-full"
				>
					{type.toUpperCase()}
				</Tag>
			)
		},
		{
			title: "版本",
			dataIndex: "version",
			key: "version",
			render: (text: string) => <Text className="text-gray-600">v{text}</Text>
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (text: string) => (
				<Text className="text-gray-600">{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</Text>
			)
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={status === "active" ? "green" : "red"} className="px-3 py-1 rounded-full">
					{status === "active" ? "已激活" : "未激活"}
				</Tag>
			)
		},
		{
			title: "操作",
			key: "action",
			fixed: "right" as const,
			render: (_: any, record: ModelConfig) => (
				<Space>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => modalRef.current?.open(record)}
						className="text-blue-500 hover:text-blue-600"
					>
						编辑
					</Button>
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record)}
						className="text-red-500 hover:text-red-600"
					>
						删除
					</Button>
				</Space>
			)
		}
	];

	const handleDelete = (model: ModelConfig) => {
		Modal.confirm({
			title: "确认删除",
			content: `确定要删除模型 ${model.name} 吗？`,
			onOk: () => {
				setModels(models.filter(m => m.id !== model.id));
				message.success("删除成功");
			}
		});
	};

	const handleModalOk = (values: any) => {
		if (values.id) {
			setModels(models.map(m => (m.id === values.id ? { ...m, ...values } : m)));
			message.success("更新成功");
		} else {
			setModels([
				...models,
				{ ...values, id: Date.now().toString(), createdAt: new Date().toISOString() }
			]);
			message.success("添加成功");
		}
	};

	// 过滤数据
	const filteredData = models.filter(item => {
		const searchLower = searchText.toLowerCase();
		return (
			item.name.toLowerCase().includes(searchLower) ||
			item.type.toLowerCase().includes(searchLower) ||
			item.version.toLowerCase().includes(searchLower)
		);
	});

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
				<div className="flex justify-between items-center">
					<div className="flex flex-col">
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">模型管理</h2>
						<p className="text-gray-500">共 {models.length} 个模型</p>
					</div>
					<div className="flex items-center gap-4">
						<Input
							placeholder="搜索模型..."
							prefix={<SearchOutlined className="text-gray-400" />}
							value={searchText}
							onChange={e => setSearchText(e.target.value)}
							className={clsx(
								"w-64",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => modalRef.current?.open()}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							添加模型
						</Button>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
				<Table
					columns={columns}
					dataSource={filteredData}
					rowKey="id"
					pagination={{
						...pagination,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 项`,
						className: "mt-4"
					}}
					loading={loading}
					scroll={{ x: true }}
					className="transition-all duration-300"
				/>
			</div>

			<ModelManageModal ref={modalRef} onOk={handleModalOk} />
		</div>
	);
};

export default ModelsManage;
