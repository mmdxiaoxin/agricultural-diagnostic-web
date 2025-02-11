import { DictItem, UserItem, UserListParams } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { deleteUserById, getUserList, resetUserPassword } from "@/api/modules/user";
import { ROLE_COLOR } from "@/enums";
import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	QuestionCircleOutlined,
	ReloadOutlined
} from "@ant-design/icons";
import {
	Button,
	Col,
	Collapse,
	CollapseProps,
	Input,
	message,
	Popconfirm,
	Row,
	Space,
	Table,
	TableProps,
	Tag
} from "antd";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import InfoDrawer, { InfoDrawerRef } from "./InfoDrawer";

const User = () => {
	const infoDrawerRef = useRef<InfoDrawerRef>(null);

	const [loading, setLoading] = useState(false);
	const [queryParams, setQueryParams] = useState<UserListParams>({ page: 1, pageSize: 10 });
	const [roleDict, setRoleDict] = useState<DictItem[]>([]);
	const [userList, setUserList] = useState<UserItem[]>([]);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		total: number;
	}>();
	const [expandSearch, setExpandSearch] = useState(false);

	// 搜索条件改变时更新查询参数
	const handleSearchChange = (key: string, value: string) => {
		setQueryParams(prev => ({
			...prev,
			[key]: value
		}));
	};

	const handleView = (user_id: number | string) => {
		infoDrawerRef.current?.open(user_id);
	};

	const handleEdit = (user_id: number | string) => {
		infoDrawerRef.current?.open(user_id, "edit");
	};

	const handleResetPassword = async (user_id: number | string) => {
		try {
			const res = await resetUserPassword(user_id);
			if (res.code !== 200) throw new Error(res.message);
			message.success("密码重置成功 🎉");
			fetchData(queryParams);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleDelete = async (user_id: number | string) => {
		try {
			await deleteUserById(user_id);
			message.success("用户删除成功 🎉");
			fetchData(queryParams);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const columns: TableProps<UserItem>["columns"] = [
		{
			title: "用户名",
			dataIndex: "username",
			key: "username",
			render: text => <a>{text}</a>,
			align: "center"
		},
		{
			title: "权限",
			dataIndex: "role_id",
			key: "role_id",
			render: (_, { role_id }) => {
				const role = roleDict.find(item => item.key === role_id);
				if (!role) return null;
				return (
					<Tag color={ROLE_COLOR[role.value as keyof typeof ROLE_COLOR] || "default"}>
						{role.value}
					</Tag>
				);
			},
			align: "center",
			filters: roleDict.map(item => ({ text: item.value, value: item.key })),
			onFilter(value, record) {
				return record.role_id === value;
			}
		},
		{
			title: "姓名",
			dataIndex: "name",
			key: "name",
			align: "center"
		},
		{
			title: "手机号",
			dataIndex: "phone",
			key: "phone",
			align: "center"
		},
		{
			title: "地址",
			dataIndex: "address",
			key: "address",
			align: "center"
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			align: "center",
			sortDirections: ["descend", "ascend"],
			render: text => new Date(text).toLocaleString(),
			sorter: (a, b) => {
				if (a.createdAt && b.createdAt) {
					const aTime = new Date(a.createdAt).getTime();
					const bTime = new Date(b.createdAt).getTime();
					return aTime - bTime;
				} else {
					return 0;
				}
			}
		},
		{
			title: "修改时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			align: "center",
			sortDirections: ["descend", "ascend"],
			render: text => new Date(text).toLocaleString(),
			sorter: (a, b) => {
				if (a.createdAt && b.createdAt) {
					const aTime = new Date(a.createdAt).getTime();
					const bTime = new Date(b.createdAt).getTime();
					return aTime - bTime;
				} else {
					return 0;
				}
			}
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			render: (_, record) => (
				<Space size="small">
					<Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
						查看
					</Button>
					<Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
						编辑
					</Button>
					<Popconfirm
						placement="top"
						title={`确定要重置吗？`}
						description={<span>重置后密码将恢复为初始密码 123456</span>}
						okText="确认"
						cancelText="取消"
						onConfirm={() => handleResetPassword(record.id)}
					>
						<Button type="text" icon={<ReloadOutlined />}>
							重置密码
						</Button>
					</Popconfirm>
					<Popconfirm
						placement="top"
						title={`确定要删除吗？`}
						okButtonProps={{ danger: true }}
						okText="确认"
						cancelText="取消"
						icon={<QuestionCircleOutlined style={{ color: "red" }} />}
						onConfirm={() => handleDelete(record.id)}
					>
						<Button type="text" icon={<DeleteOutlined />} danger>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	const fetchData = async (params: UserListParams) => {
		setLoading(true);
		try {
			const dictRes = await getRoleDict();
			if (dictRes.code !== 200) throw new Error(dictRes.message);
			const userRes = await getUserList(params);
			if (userRes.code !== 200) throw new Error(userRes.message);

			setRoleDict(dictRes.data || []);
			setUserList(userRes.data?.list || []);
			setPagination(userRes.data?.pagination || { page: 1, pageSize: 10, total: 0 });
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(queryParams);
	}, []);

	const collapseItems: CollapseProps["items"] = [
		{
			key: "1",
			label: "筛选搜索",
			children: (
				<>
					<Row gutter={16}>
						<Col span={6}>
							<Input
								placeholder="用户名"
								value={queryParams.username}
								onChange={e => handleSearchChange("username", e.target.value)}
							/>
						</Col>
						<Col span={6}>
							<Input
								placeholder="姓名"
								value={queryParams.name}
								onChange={e => handleSearchChange("name", e.target.value)}
							/>
						</Col>
						<Col span={6}>
							<Input
								placeholder="手机号"
								value={queryParams.phone}
								onChange={e => handleSearchChange("phone", e.target.value)}
							/>
						</Col>
						<Col span={6}>
							<Input
								placeholder="地址"
								value={queryParams.address}
								onChange={e => handleSearchChange("address", e.target.value)}
							/>
						</Col>
					</Row>
					<Row style={{ marginTop: 16 }}>
						<Space>
							<Button type="primary" onClick={() => fetchData(queryParams)}>
								搜索
							</Button>
							<Button
								onClick={() => {
									setQueryParams({ page: 1, pageSize: 10 });
									fetchData({ page: 1, pageSize: 10 });
								}}
							>
								重置
							</Button>
						</Space>
					</Row>
				</>
			)
		}
	];

	return (
		<div className={styles.container}>
			{/* 搜索部分 */}
			<Collapse
				defaultActiveKey={expandSearch ? ["1"] : []}
				onChange={() => setExpandSearch(prev => !prev)}
				accordion
				bordered={false}
				items={collapseItems} // 使用新的写法
			>
				{/* Collapse 使用新写法，不需要 Panel 了 */}
			</Collapse>

			{/* 表格部分 */}
			<div style={{ padding: 16 }}>
				<Table<UserItem>
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={userList}
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
				/>
			</div>

			<InfoDrawer ref={infoDrawerRef} onSave={() => fetchData(queryParams)} />
		</div>
	);
};

export default User;
