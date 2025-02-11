import { DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Space, Table, TableProps, Tag } from "antd";
import "./index.scss";

// 定义接口
interface DataType {
	key: string;
	username: string;
	permissions: string[];
	name: string;
	phone: string;
	address: string;
	createdAt: string;
	updatedAt: string;
}

const columns: TableProps<DataType>["columns"] = [
	{
		title: "用户名",
		dataIndex: "username",
		key: "username",
		render: text => <a>{text}</a>
	},
	{
		title: "权限",
		dataIndex: "permissions",
		key: "permissions",
		render: (_, { permissions }) => (
			<Space>
				{permissions.map((permission, index) => (
					<Tag key={index}>{permission}</Tag>
				))}
			</Space>
		)
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
		key: "createdAt"
	},
	{
		title: "修改时间",
		dataIndex: "updatedAt",
		key: "updatedAt"
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

const data: DataType[] = [
	{
		key: "1",
		username: "john_brown",
		permissions: ["admin"],
		name: "John Brown",
		phone: "123-456-7890",
		address: "New York No. 1 Lake Park",
		createdAt: "2022-01-01 10:00:00",
		updatedAt: "2023-01-01 10:00:00"
	},
	{
		key: "2",
		username: "jim_green",
		permissions: ["viewer"],
		name: "Jim Green",
		phone: "987-654-3210",
		address: "London No. 1 Lake Park",
		createdAt: "2022-02-01 11:00:00",
		updatedAt: "2023-02-01 11:00:00"
	},
	{
		key: "3",
		username: "joe_black",
		permissions: ["editor"],
		name: "Joe Black",
		phone: "555-555-5555",
		address: "Sydney No. 1 Lake Park",
		createdAt: "2022-03-01 12:00:00",
		updatedAt: "2023-03-01 12:00:00"
	}
];

const User = () => {
	return (
		<div className="card">
			<Table<DataType> columns={columns} dataSource={data} />
		</div>
	);
};

export default User;
