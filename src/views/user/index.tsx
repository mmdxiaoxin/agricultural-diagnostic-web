import { DictItem, UserItem, UserListParams } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { getUserList } from "@/api/modules/user";
import { DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, message, Space, Table, TableProps, Tag } from "antd";
import { useEffect, useState } from "react";
import "./index.scss";

const ROLE_COLOR = {
	专家: "blue",
	农民: "green",
	管理员: "orange"
};

const User = () => {
	const [loading, setLoading] = useState(false);
	const [queryParams, setQueryParams] = useState<UserListParams>({ page: 1, pageSize: 10 });
	const [roleDict, setRoleDict] = useState<DictItem[]>([]);
	const [userList, setUserList] = useState<UserItem[]>([]);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		total: number;
	}>();

	const columns: TableProps<UserItem>["columns"] = [
		{
			title: "用户名",
			dataIndex: "username",
			key: "username",
			render: text => <a>{text}</a>
		},
		{
			title: "权限",
			dataIndex: "role_id",
			key: "role_id",
			render: (_, { role_id }) => {
				const role = roleDict.find(item => item.key === role_id);
				if (!role) return null;
				return (
					<Tag
						color={
							role?.value in ROLE_COLOR
								? ROLE_COLOR[role.value as keyof typeof ROLE_COLOR]
								: "default"
						}
					>
						{role?.value}
					</Tag>
				);
			},
			filters: roleDict.map(item => ({ text: item.value, value: item.key })),
			onFilter(value, record) {
				return record.role_id === value;
			}
		},
		{
			title: "姓名",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "手机号",
			dataIndex: "phone",
			key: "phone"
		},
		{
			title: "地址",
			dataIndex: "address",
			key: "address"
		},
		{
			title: "创建时间",
			dataIndex: "createdAt",
			key: "createdAt",
			sortDirections: ["descend", "ascend"],
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
			sortDirections: ["descend", "ascend"],
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
			render: (_, record) => (
				<Space size="small">
					<Button type="text" icon={<EyeOutlined />} onClick={() => console.log("查看", record)}>
						查看
					</Button>
					<Button type="text" icon={<EditOutlined />} onClick={() => console.log("编辑", record)}>
						编辑
					</Button>
					<Button
						type="text"
						icon={<ReloadOutlined />}
						onClick={() => console.log("重置密码", record)}
					>
						重置密码
					</Button>
					<Button
						type="text"
						icon={<DeleteOutlined />}
						danger
						onClick={() => console.log("删除", record)}
					>
						删除
					</Button>
				</Space>
			)
		}
	];

	const handleQuery = () => {};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const dictRes = await getRoleDict();
				if (dictRes.code !== 200) throw new Error(dictRes.message);
				const userRes = await getUserList(queryParams);
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
		fetchData();
	}, []);

	return (
		<div>
			<Table<UserItem>
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
						console.log(page, pageSize);
					}
				}}
			/>
		</div>
	);
};

export default User;
