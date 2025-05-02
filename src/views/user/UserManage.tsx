import { UserItem, UserListParams } from "@/api/interface";
import { deleteUserById, getUserList, resetUserById, updateUserStatus } from "@/api/modules/user";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import { ROLE_COLOR } from "@/constants";
import {
	DeleteOutlined,
	DownOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	ReloadOutlined,
	UpOutlined,
	UserAddOutlined
} from "@ant-design/icons";
import {
	Button,
	message,
	Popconfirm,
	Popover,
	Select,
	Space,
	Table,
	TableProps,
	Tag,
	Tooltip
} from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import UserInfoDrawer, { InfoDrawerRef } from "../../components/Drawer/UserInfoDrawer";

const UserManage = () => {
	const infoDrawerRef = useRef<InfoDrawerRef>(null);

	const [loading, setLoading] = useState(false);
	const [queryParams, setQueryParams] = useState<UserListParams>({ page: 1, pageSize: 10 });
	const [userList, setUserList] = useState<UserItem[]>([]);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		total: number;
	}>();

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
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
			render: text => <TextCell className="text-blue-500 hover:text-blue-600" text={text} />,
			align: "center"
		},
		{
			title: "权限",
			dataIndex: "roles",
			key: "roles",
			responsive: ["sm", "md", "lg", "xl", "xxl"],
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
			title: "状态",
			dataIndex: "status",
			key: "status",
			responsive: ["md", "lg", "xl", "xxl"],
			render: (_, { status, id }) => {
				return (
					<Popover
						content={
							<Select
								defaultValue={status ? 1 : 0}
								style={{ width: 120 }}
								onChange={async value => {
									try {
										await updateUserStatus(id, value);
										message.success("状态更新成功");
										fetchData(queryParams);
									} catch (error: any) {
										message.error(error.message);
									}
								}}
							>
								<Select.Option value={1}>启用</Select.Option>
								<Select.Option value={0}>禁用</Select.Option>
							</Select>
						}
						trigger="hover"
					>
						{status ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>}
					</Popover>
				);
			},
			align: "center"
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			responsive: ["lg", "xl", "xxl"],
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "修改时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
			responsive: ["lg", "xl", "xxl"],
			render: text => <TextCell text={dayjs(text).format("YYYY-MM-DD HH:mm:ss")} />
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
			render: (_, record) => (
				<Space wrap className="flex flex-col xl:flex-row">
					<Tooltip title="编辑用户信息">
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => handleEdit(record.id)}
							className="text-blue-500 hover:text-blue-600"
						>
							编辑
						</Button>
					</Tooltip>
					<Tooltip title="重置用户密码">
						<Popconfirm
							placement="top"
							title="确定要重置吗？"
							description={<span>重置后密码将恢复为初始密码 123456</span>}
							okText="确认"
							cancelText="取消"
							onConfirm={() => handleResetPassword(record.id)}
						>
							<Button
								type="link"
								icon={<ReloadOutlined />}
								className="text-blue-500 hover:text-blue-600"
							>
								重置密码
							</Button>
						</Popconfirm>
					</Tooltip>
					<Tooltip title="删除用户">
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
				title="用户管理"
				description="管理系统用户信息，包括添加、编辑、删除用户等操作"
				search={{
					placeholder: "搜索用户...",
					onSearch: (value: string) => fetchData({ ...queryParams, username: value })
				}}
				actionButton={{
					text: "添加新用户",
					icon: <UserAddOutlined />,
					onClick: () => infoDrawerRef.current?.open("add")
				}}
				statistics={{
					label: "用户总数：",
					value: userList.length
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
				<Table<UserItem>
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={userList}
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
					expandable={{
						expandedRowRender: record => (
							<div className="p-4 bg-gray-50 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
										<h4 className="text-sm font-medium text-gray-500">基本信息</h4>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">姓名：</span>
												<span className="text-gray-800">{record.profile?.name || "未设置"}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">电话：</span>
												<span className="text-gray-800">{record.profile?.phone || "未设置"}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">地址：</span>
												<span className="text-gray-800">{record.profile?.address || "未设置"}</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
										<h4 className="text-sm font-medium text-gray-500">账号信息</h4>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">用户名：</span>
												<span className="text-gray-800">{record.username}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">状态：</span>
												{record.status ? (
													<Tag color="success">启用</Tag>
												) : (
													<Tag color="error">禁用</Tag>
												)}
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">创建时间：</span>
												<span className="text-gray-800">
													{dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}
												</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
										<h4 className="text-sm font-medium text-gray-500">权限信息</h4>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<span className="text-gray-600 min-w-[60px]">角色：</span>
												<Space wrap>
													{record.roles?.map(role => (
														<Tag
															color={ROLE_COLOR[role.alias as keyof typeof ROLE_COLOR] || "default"}
															key={role.id}
														>
															{role.alias}
														</Tag>
													))}
												</Space>
											</div>
										</div>
									</div>
								</div>
							</div>
						),
						rowExpandable: record => true,
						expandIcon: ({ expanded, onExpand, record }) => (
							<Tooltip title={expanded ? "收起" : "展开"}>
								<Button
									type="text"
									icon={expanded ? <UpOutlined /> : <DownOutlined />}
									onClick={e => onExpand(record, e)}
									className="text-gray-500 hover:text-gray-700"
								/>
							</Tooltip>
						)
					}}
					className={clsx("rounded-lg", "overflow-hidden", "border border-gray-100")}
				/>
			</div>

			<UserInfoDrawer ref={infoDrawerRef} onSave={() => fetchData(queryParams)} />
		</div>
	);
};

export default UserManage;
