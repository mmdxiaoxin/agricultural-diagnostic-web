import { useAppDispatch, useAppSelector } from "@/hooks";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { SettingOutlined } from "@ant-design/icons";
import { Divider, Space, Switch } from "antd";

const SystemConfig: React.FC = () => {
	const { themeConfig } = useAppSelector(state => state.global);
	const { breadcrumb, tabs, footer } = themeConfig;
	const { isCollapse } = useAppSelector(state => state.menu);

	const dispatch = useAppDispatch();

	// 切换配置项
	const onChange = (checked: boolean, keyName: string) => {
		dispatch(setThemeConfig({ ...themeConfig, [keyName]: !checked }));
	};

	// 更新菜单折叠状态
	const updateCollapse = (checked: boolean) => {
		dispatch(setCollapse(checked));
	};

	return (
		<div className="w-full h-full bg-white p-4 rounded-lg">
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
