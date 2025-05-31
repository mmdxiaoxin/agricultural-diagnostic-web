import { MenuItem } from "@/api/interface";
import { createMenu, deleteMenu, getMenuList, updateMenu } from "@/api/modules/menu";
import IconComponent, { Icons } from "@/components/icons/IconComponent";
import MenuModal, { MenuModalRef } from "@/components/Modal/MenuModal";
import PageHeader from "@/components/PageHeader";
import TextCell from "@/components/Table/TextCell";
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	QuestionCircleOutlined
} from "@ant-design/icons";
import { Button, message, Popconfirm, Space, Table, TableProps, Tooltip } from "antd";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

const MenuManage: React.FC = () => {
	const modalRef = useRef<MenuModalRef>(null);
	const [loading, setLoading] = useState(false);
	const [menuList, setMenuList] = useState<MenuItem[]>([]);

	const handleEdit = (menu: MenuItem) => {
		modalRef.current?.open(menu);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteMenu(id);
			message.success("菜单删除成功 🎉");
			fetchData();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleSave = async (values: any) => {
		try {
			if (values.id) {
				await updateMenu(values.id, values);
				message.success("菜单更新成功 🎉");
			} else {
				await createMenu(values);
				message.success("菜单创建成功 🎉");
			}
			fetchData();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const columns: TableProps<MenuItem>["columns"] = [
		{
			title: "菜单名称",
			dataIndex: "title",
			key: "title",
			render: text => <TextCell className="text-blue-500 hover:text-blue-600" text={text} />,
			align: "center"
		},
		{
			title: "图标",
			dataIndex: "icon",
			key: "icon",
			align: "center",
			render: (icon: string) => (icon ? <IconComponent name={icon as keyof typeof Icons} /> : "-")
		},
		{
			title: "路由路径",
			dataIndex: "path",
			key: "path",
			align: "center"
		},
		{
			title: "父级菜单",
			dataIndex: "parent",
			key: "parent",
			align: "center",
			render: (parent: MenuItem | null) => <TextCell text={parent?.title || "无"} />
		},
		{
			title: "排序",
			dataIndex: "sort",
			key: "sort",
			align: "center",
			sorter: (a, b) => a.sort - b.sort
		},
		{
			title: "外链",
			dataIndex: "isLink",
			key: "isLink",
			align: "center",
			render: (isLink: string | null) => <TextCell text={isLink ? "是" : "否"} />
		},
		{
			title: "操作",
			key: "action",
			align: "center",
			render: (_, record) => (
				<Space>
					<Tooltip title="编辑菜单">
						<Button
							type="link"
							icon={<EditOutlined />}
							onClick={() => handleEdit(record)}
							className="text-blue-500 hover:text-blue-600"
						>
							编辑
						</Button>
					</Tooltip>
					<Tooltip title="删除菜单">
						<Popconfirm
							placement="top"
							title="确定要删除吗？"
							description="删除后无法恢复，且会同时删除所有子菜单"
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

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await getMenuList();
			if (response.code !== 200 || !response.data) throw new Error(response.message);
			setMenuList(response.data || []);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
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
				title="菜单管理"
				description="管理系统菜单信息，包括添加、编辑、删除菜单等操作"
				actionButton={{
					text: "添加新菜单",
					icon: <PlusOutlined />,
					onClick: () => modalRef.current?.open()
				}}
				statistics={{
					label: "菜单总数：",
					value: menuList.length
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
				<Table<MenuItem>
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={menuList}
					scroll={{ x: "max-content" }}
					className={clsx("rounded-lg", "overflow-hidden", "border border-gray-100")}
					expandable={{
						defaultExpandAllRows: true,
						expandRowByClick: true
					}}
					pagination={false}
				/>
			</div>

			<MenuModal ref={modalRef} onSave={handleSave} menuList={menuList} />
		</div>
	);
};

export default MenuManage;
