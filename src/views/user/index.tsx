import { UserItem, UserListParams } from "@/api/interface";
import { deleteUserById, getUserList, resetUserById } from "@/api/modules/user";
import { ROLE_COLOR } from "@/constants";
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
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import InfoDrawer, { InfoDrawerRef } from "./InfoDrawer";

const User = () => {
	const infoDrawerRef = useRef<InfoDrawerRef>(null);

	const [loading, setLoading] = useState(false);
	const [queryParams, setQueryParams] = useState<UserListParams>({ page: 1, pageSize: 10 });
	const [userList, setUserList] = useState<UserItem[]>([]);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		total: number;
	}>();
	const [expandSearch, setExpandSearch] = useState(false);

	const handleSearchChange = (key: string, value: string) => {
		setQueryParams(prev => ({
			...prev,
			[key]: value
		}));
	};

	const handleView = (user_id: number | string) => {
		infoDrawerRef.current?.open("view", user_id);
	};

	const handleEdit = (user_id: number | string) => {
		infoDrawerRef.current?.open("edit", user_id);
	};

	const handleResetPassword = async (user_id: number | string) => {
		try {
			const res = await resetUserById(user_id);
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
			dataIndex: "roles",
			key: "roles",
			render: (_, { roles }) => {
				return roles?.map(role => (
					<Tag color={ROLE_COLOR[role.alias as keyof typeof ROLE_COLOR] || "default"} key={role.id}>
						{role.alias}
					</Tag>
				));
			},
			align: "center"
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			align: "center",
			render: text => <span>{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</span>
		},
		{
			title: "修改时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			align: "center",
			render: text => <span>{dayjs(text).format("YYYY-MM-DD HH:mm:ss")}</span>
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			render: (_, record) => (
				<Space size="small">
					<Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
						查看
					</Button>
					<Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
						编辑
					</Button>
					<Popconfirm
						placement="top"
						title="确定要重置吗？"
						description={<span>重置后密码将恢复为初始密码 123456</span>}
						okText="确认"
						cancelText="取消"
						onConfirm={() => handleResetPassword(record.id)}
					>
						<Button type="link" icon={<ReloadOutlined />}>
							重置密码
						</Button>
					</Popconfirm>
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
				</Space>
			)
		}
	];

	const fetchData = async (params: UserListParams) => {
		setLoading(true);
		try {
			const response = await getUserList(params);
			if (response.code !== 200 || !response.data) throw new Error(response.message);
			setUserList(response.data?.list || []);
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

	const collapseItems: CollapseProps["items"] = [
		{
			key: "1",
			label: <span>{"筛选搜索"}</span>,
			extra: (
				<Button
					type="primary"
					onClick={event => {
						infoDrawerRef.current?.open("add");
						event.stopPropagation();
					}}
				>
					添加新用户
				</Button>
			),
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
				items={collapseItems}
			/>

			{/* 表格部分 */}
			<div>
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
					expandable={{
						expandedRowRender: record => (
							<div style={{ padding: 10 }}>
								<h4>用户资料</h4>
								<p>
									<strong>姓名：</strong>
									{record.profile?.name}
								</p>
								<p>
									<strong>电话：</strong>
									{record.profile?.phone}
								</p>
								<p>
									<strong>地址：</strong>
									{record.profile?.address}
								</p>
							</div>
						),
						rowExpandable: record => record.profile != null
					}}
				/>
			</div>

			<InfoDrawer ref={infoDrawerRef} onSave={() => fetchData(queryParams)} />
		</div>
	);
};

export default User;
