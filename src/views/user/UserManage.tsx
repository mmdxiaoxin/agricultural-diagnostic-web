import { UserItem, UserListParams } from "@/api/interface";
import { deleteUserById, getUserList, resetUserById, updateUserStatus } from "@/api/modules/user";
import { ROLE_COLOR } from "@/constants";
import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	QuestionCircleOutlined,
	ReloadOutlined,
	SearchOutlined,
	SettingOutlined,
	UserAddOutlined
} from "@ant-design/icons";
import {
	Button,
	Collapse,
	CollapseProps,
	Input,
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
			render: text => <a className="text-blue-500 hover:text-blue-600">{text}</a>,
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
			title: "状态",
			dataIndex: "status",
			key: "status",
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
					<Tooltip title="查看用户信息">
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => handleView(record.id)}
							className="text-blue-500 hover:text-blue-600"
						>
							查看
						</Button>
					</Tooltip>
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

	const collapseItems: CollapseProps["items"] = [
		{
			key: "1",
			label: (
				<div className="flex items-center gap-2">
					<SettingOutlined className="text-lg text-gray-500" />
					<span className="text-base font-medium">用户管理功能区</span>
				</div>
			),
			extra: (
				<Button
					type="primary"
					icon={<UserAddOutlined />}
					onClick={event => {
						infoDrawerRef.current?.open("add");
						event.stopPropagation();
					}}
					className={clsx(
						"px-6 h-10",
						"rounded-lg",
						"bg-blue-500 hover:bg-blue-600",
						"border-none",
						"shadow-sm hover:shadow-md",
						"transition-all duration-300",
						"flex items-center gap-2"
					)}
				>
					添加新用户
				</Button>
			),
			children: (
				<div className="flex flex-col gap-6">
					<div className="flex justify-between items-center">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">用户管理</h2>
							<p className="text-gray-500">共 {userList.length} 个用户</p>
						</div>
						<div className="flex items-center gap-4">
							<Input
								placeholder="搜索用户..."
								prefix={<SearchOutlined className="text-gray-400" />}
								value={queryParams.username}
								onChange={e => handleSearchChange("username", e.target.value)}
								className={clsx(
									"w-64",
									"rounded-lg",
									"border-gray-200",
									"focus:border-blue-500",
									"focus:ring-1 focus:ring-blue-500",
									"transition-all duration-300"
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-4">
						<Input
							placeholder="姓名"
							value={queryParams.name}
							onChange={e => handleSearchChange("name", e.target.value)}
							className={clsx(
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Input
							placeholder="手机号"
							value={queryParams.phone}
							onChange={e => handleSearchChange("phone", e.target.value)}
							className={clsx(
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Input
							placeholder="地址"
							value={queryParams.address}
							onChange={e => handleSearchChange("address", e.target.value)}
							className={clsx(
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => fetchData(queryParams)}
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"bg-blue-500 hover:bg-blue-600",
									"border-none",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300"
								)}
							>
								搜索
							</Button>
							<Button
								onClick={() => {
									setQueryParams({ page: 1, pageSize: 10 });
									fetchData({ page: 1, pageSize: 10 });
								}}
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"border-gray-200",
									"hover:border-gray-300",
									"transition-all duration-300"
								)}
							>
								重置
							</Button>
						</Space>
					</div>
				</div>
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
			<Collapse
				defaultActiveKey={expandSearch ? ["1"] : []}
				onChange={() => setExpandSearch(prev => !prev)}
				accordion
				bordered={false}
				items={collapseItems}
				className={clsx(
					"mb-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
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
								<h4 className="text-lg font-medium text-gray-800 mb-3">用户资料</h4>
								<div className="grid grid-cols-3 gap-4">
									<div>
										<strong className="text-gray-600">姓名：</strong>
										<span className="text-gray-800">{record.profile?.name || "未设置"}</span>
									</div>
									<div>
										<strong className="text-gray-600">电话：</strong>
										<span className="text-gray-800">{record.profile?.phone || "未设置"}</span>
									</div>
									<div>
										<strong className="text-gray-600">地址：</strong>
										<span className="text-gray-800">{record.profile?.address || "未设置"}</span>
									</div>
								</div>
							</div>
						),
						rowExpandable: record => record.profile != null
					}}
					className={clsx("rounded-lg", "overflow-hidden", "border border-gray-100")}
				/>
			</div>

			<UserInfoDrawer ref={infoDrawerRef} onSave={() => fetchData(queryParams)} />
		</div>
	);
};

export default User;
