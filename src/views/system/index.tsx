import { getAuthRoutes } from "@/api/modules";
import IconComponent, { Icons } from "@/components/IconComponent";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuOutlined, SettingOutlined } from "@ant-design/icons";
import { Divider, Space, Switch, Table, TableColumnsType } from "antd";
import { useEffect, useState } from "react";

const SystemConfig: React.FC = () => {
	const [menuList, setMenuList] = useState<Menu.MenuOptions[]>([]);

	const { isCollapse } = useAppSelector(state => state.menu);
	const { themeConfig } = useAppSelector(state => state.global);
	const { breadcrumb, tabs, footer } = themeConfig;

	const dispatch = useAppDispatch();

	// 递归函数，用于遍历菜单并设置children为undefined
	const processMenu = (menuList: Menu.MenuOptions[]): Menu.MenuOptions[] => {
		return menuList.map(menu => {
			// 如果子项有children且为空数组，则将children设置为undefined
			if (menu.children && menu.children.length === 0) {
				menu.children = undefined;
			}

			// 如果子项有children且非空，递归处理
			if (menu.children && menu.children.length > 0) {
				menu.children = processMenu(menu.children);
			}

			return menu;
		});
	};

	const fetchMenuList = async () => {
		try {
			const response = await getAuthRoutes();
			if (response.code === 200 && response.data) {
				// 递归处理菜单数据
				const updatedMenuList = processMenu(response.data);
				setMenuList(updatedMenuList);
			}
		} catch (error) {
			// Handle error (optional)
		}
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
	const columns: TableColumnsType<Menu.MenuOptions> = [
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

	return (
		<div className="w-full h-full bg-white p-4 rounded-lg overflow-y-auto">
			<Divider>
				<Space>
					<MenuOutlined />
					菜单设置
				</Space>
			</Divider>

			{/* 树形表格展示菜单 */}
			<Table<Menu.MenuOptions>
				columns={columns}
				dataSource={menuList}
				pagination={false}
				rowKey="path"
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
