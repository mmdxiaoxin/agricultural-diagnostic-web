import { RoleItem, RoleListParams } from "@/api/interface";
import { createRole, deleteRoleById, getRoleList, updateRole } from "@/api/modules/role";
import PageHeader from "@/components/PageHeader";
import RoleModal, { RoleModalRef } from "@/components/Modal/RoleModal";
import MenuConfigModal, { MenuConfigModalRef } from "@/components/Modal/MenuConfigModal";
import TextCell from "@/components/Table/TextCell";
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
	SettingOutlined
} from "@ant-design/icons";
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Space,
	Table,
	TableProps,
	Tooltip
} from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const RoleManage: React.FC = () => {
	const modalRef = useRef<RoleModalRef>(null);
	const menuConfigRef = useRef<MenuConfigModalRef>(null);
	const [loading, setLoading] = useState(false);
	const [queryParams, setQueryParams] = useState<RoleListParams>({ page: 1, pageSize: 10 });
	const [roleList, setRoleList] = useState<RoleItem[]>([]);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		total: number;
	}>();
	const [modalVisible, setModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

	const handleEdit = (role: RoleItem) => {
		setEditingRole(role);
		form.setFieldsValue(role);
		setModalVisible(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteRoleById(id);
			message.success("角色删除成功 🎉");
			fetchData(queryParams);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			if (editingRole) {
				await updateRole(editingRole.id, values);
				message.success("角色更新成功 🎉");
			} else {
				await createRole(values);
				message.success("角色创建成功 🎉");
			}
			setModalVisible(false);
			fetchData(queryParams);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleModalCancel = () => {
		setModalVisible(false);
		setEditingRole(null);
		form.resetFields();
	};

	const handleSave = async (values: any) => {
		try {
			if (values.id) {
				await updateRole(values.id, values);
				message.success("角色更新成功 🎉");
			} else {
				await createRole(values);
				message.success("角色创建成功 🎉");
			}
			fetchData(queryParams);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleConfigMenu = (role: RoleItem) => {
		menuConfigRef.current?.open(role.id);
	};

	const columns: TableProps<RoleItem>["columns"] = [
		{
			title: "角色名称",
			dataIndex: "name",
			key: "name",
			render: text => <TextCell className="text-blue-500 hover:text-blue-600" text={text} />,
			align: "center"
		},
		{
			title: "角色别名",
			dataIndex: "alias",
			key: "alias",
			align: "center"
		},
		{
			title: "描述",
			dataIndex: "description",
			key: "description",
			align: "center"
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			align: "center"
		},
		{
			title: "修改时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />,
			align: "center"
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			render: (_, record) => (
				<Space>
					<Tooltip title="编辑角色">
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => handleEdit(record)}
							className="text-blue-500 hover:text-blue-600"
						>
							编辑
						</Button>
					</Tooltip>
					<Tooltip title="配置菜单">
						<Button
							type="link"
							icon={<SettingOutlined />}
							onClick={() => handleConfigMenu(record)}
							className="text-green-500 hover:text-green-600"
						>
							配置菜单
						</Button>
					</Tooltip>
					<Tooltip title="删除角色">
						<Popconfirm
							placement="top"
							title="确定要删除吗？"
							okButtonProps={{ danger: true }}
							okText="确认"
							cancelText="取消"
							icon={<QuestionCircleOutlined style={{ color: "red" }} />}
							onConfirm={() => handleDelete(record.id)}
						>
							<Button type="link" icon={<DeleteOutlined />} danger>
								删除
							</Button>
						</Popconfirm>
					</Tooltip>
				</Space>
			)
		}
	];

	const fetchData = async (params: RoleListParams) => {
		setLoading(true);
		try {
			const response = await getRoleList(params);
			if (response.code !== 200 || !response.data) throw new Error(response.message);
			setRoleList(response.data?.list || []);
			setPagination({
				page: response.data.page ?? 1,
				pageSize: response.data.pageSize ?? 10,
				total: response.data.total ?? 0
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(queryParams);
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
				title="角色管理"
				description="管理系统角色信息，包括添加、编辑、删除角色等操作"
				search={{
					placeholder: "搜索角色...",
					onSearch: (value: string) => fetchData({ ...queryParams, keyword: value })
				}}
				actionButton={{
					text: "添加新角色",
					icon: <PlusOutlined />,
					onClick: () => modalRef.current?.open()
				}}
				statistics={{
					label: "角色总数：",
					value: pagination?.total ?? 0
				}}
			/>

			<div
				className={clsx(
					"flex-1",
					"p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<Table<RoleItem>
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={roleList}
					scroll={{ x: "max-content" }}
					pagination={{
						current: pagination?.page,
						pageSize: pagination?.pageSize,
						total: pagination?.total,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal(total) {
							return `共 ${total} 条`;
						},
						onChange(page, pageSize) {
							setQueryParams({ ...queryParams, page, pageSize });
							fetchData({ ...queryParams, page, pageSize });
						}
					}}
					className={clsx("rounded-lg", "overflow-hidden", "border border-gray-100")}
				/>
			</div>

			<Modal
				title={editingRole ? "编辑角色" : "添加角色"}
				open={modalVisible}
				onOk={handleModalOk}
				onCancel={handleModalCancel}
				destroyOnClose
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="角色名称"
						rules={[{ required: true, message: "请输入角色名称" }]}
					>
						<Input placeholder="请输入角色名称" />
					</Form.Item>
					<Form.Item
						name="alias"
						label="角色别名"
						rules={[{ required: true, message: "请输入角色别名" }]}
					>
						<Input placeholder="请输入角色别名" />
					</Form.Item>
					<Form.Item
						name="description"
						label="角色描述"
						rules={[{ required: true, message: "请输入角色描述" }]}
					>
						<Input.TextArea placeholder="请输入角色描述" rows={4} />
					</Form.Item>
				</Form>
			</Modal>

			<RoleModal ref={modalRef} onSave={handleSave} />
			<MenuConfigModal ref={menuConfigRef} onSuccess={() => fetchData(queryParams)} />
		</div>
	);
};

export default RoleManage;
