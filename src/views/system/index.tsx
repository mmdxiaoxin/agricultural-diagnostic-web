import { MenuItem } from "@/api/interface";
import { getMenuList } from "@/api/modules";
import IconComponent, { Icons } from "@/components/IconComponent";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuOutlined, SettingOutlined } from "@ant-design/icons";
import { Divider, Space, Switch, Table, TableColumnsType, TableProps } from "antd";
import { useState, useEffect } from "react";

type TableRowSelection<T extends object = object> = TableProps<T>["rowSelection"];

const SystemConfig: React.FC = () => {
	const [menuList, setMenuList] = useState<MenuItem[]>([]);

	const { themeConfig } = useAppSelector(state => state.global);
	const { breadcrumb, tabs, footer } = themeConfig;
	const { isCollapse } = useAppSelector(state => state.menu);

	const dispatch = useAppDispatch();

	const fetchMenuList = async () => {
		try {
			const response = await getMenuList();
			if (response.code === 200 && response.data) {
				setMenuList(response.data);
			}
		} catch (error) {}
	};

	useEffect(() => {
		fetchMenuList();
	}, []);

	// 切换配置项
	const onChange = (checked: boolean, keyName: string) => {
		dispatch(setThemeConfig({ ...themeConfig, [keyName]: !checked }));
	};

	// 更新菜单折叠状态
	const updateCollapse = (checked: boolean) => {
		dispatch(setCollapse(checked));
	};

	// 表格列配置
	const columns: TableColumnsType<MenuItem> = [
		{
			title: "icon",
			dataIndex: "icon",
			key: "icon",
			render: (icon: string) => <IconComponent name={icon as keyof typeof Icons} />
		},
		{
			title: "title",
			dataIndex: "title",
			key: "title"
		},
		{
			title: "path",
			dataIndex: "path",

			key: "path"
		}
	];

	const rowSelection: TableRowSelection<MenuItem> = {
		onChange: (selectedRowKeys, selectedRows) => {
			console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
		},
		onSelect: (record, selected, selectedRows) => {
			console.log(record, selected, selectedRows);
		},
		onSelectAll: (selected, selectedRows, changeRows) => {
			console.log(selected, selectedRows, changeRows);
		}
	};

	return (
		<div className="w-full h-full bg-white p-4 rounded-lg overflow-y-auto">
			<Divider>
				<Space>
					<MenuOutlined />
					菜单设置
				</Space>
			</Divider>

			{/* 树形表格展示菜单 */}
			<Table<MenuItem>
				columns={columns}
				rowSelection={{ ...rowSelection }}
				dataSource={menuList}
				pagination={false}
				rowKey="id"
			/>

			<Divider>
				<Space>
					<SettingOutlined />
					界面设置
				</Space>
			</Divider>

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<span>折叠菜单</span>
					<Switch checked={isCollapse} onChange={updateCollapse} />
				</div>
				<div className="flex justify-between items-center">
					<span>面包屑导航</span>
					<Switch checked={!breadcrumb} onChange={e => onChange(e, "breadcrumb")} />
				</div>
				<div className="flex justify-between items-center">
					<span>标签栏</span>
					<Switch checked={!tabs} onChange={e => onChange(e, "tabs")} />
				</div>
				<div className="flex justify-between items-center">
					<span>页脚</span>
					<Switch checked={!footer} onChange={e => onChange(e, "footer")} />
				</div>
			</div>
		</div>
	);
};

export default SystemConfig;
