import SwitchDark from "@/components/SwitchDark";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { FireOutlined, SettingOutlined } from "@ant-design/icons";
import { Divider, Drawer, Switch } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Theme: React.FC = () => {
	const [visible, setVisible] = useState<boolean>(false);

	// 使用 useSelector 从 Redux store 中获取 global 和 menu 的状态
	const { themeConfig } = useSelector((state: any) => state.global);
	const { weakOrGray, breadcrumb, tabs, footer } = themeConfig;
	const { isCollapse } = useSelector((state: any) => state.menu);

	// 使用 useDispatch 来获取 dispatch 函数
	const dispatch = useDispatch();

	// 设置灰色模式或色弱模式
	const setWeakOrGray = (checked: boolean, theme: string) => {
		dispatch(setThemeConfig({ ...themeConfig, weakOrGray: checked ? theme : "" }));
	};

	// 切换配置项
	const onChange = (checked: boolean, keyName: string) => {
		dispatch(setThemeConfig({ ...themeConfig, [keyName]: !checked }));
	};

	// 更新菜单折叠状态
	const updateCollapse = (checked: boolean) => {
		dispatch(setCollapse(checked));
	};

	return (
		<>
			<i className="icon-style iconfont icon-zhuti" onClick={() => setVisible(true)}></i>
			<Drawer
				title="布局设置"
				closable={false}
				onClose={() => setVisible(false)}
				visible={visible}
				width={320}
			>
				{/* 全局主题 */}
				<Divider className="divider">
					<FireOutlined />
					全局主题
				</Divider>
				<div className="theme-item">
					<span>暗黑模式</span>
					<SwitchDark />
				</div>
				<div className="theme-item">
					<span>灰色模式</span>
					<Switch checked={weakOrGray === "gray"} onChange={e => setWeakOrGray(e, "gray")} />
				</div>
				<div className="theme-item">
					<span>色弱模式</span>
					<Switch checked={weakOrGray === "weak"} onChange={e => setWeakOrGray(e, "weak")} />
				</div>
				<br />
				{/* 界面设置 */}
				<Divider className="divider">
					<SettingOutlined />
					界面设置
				</Divider>
				<div className="theme-item">
					<span>折叠菜单</span>
					<Switch checked={isCollapse} onChange={updateCollapse} />
				</div>
				<div className="theme-item">
					<span>面包屑导航</span>
					<Switch checked={!breadcrumb} onChange={e => onChange(e, "breadcrumb")} />
				</div>
				<div className="theme-item">
					<span>标签栏</span>
					<Switch checked={!tabs} onChange={e => onChange(e, "tabs")} />
				</div>
				<div className="theme-item">
					<span>页脚</span>
					<Switch checked={!footer} onChange={e => onChange(e, "footer")} />
				</div>
			</Drawer>
		</>
	);
};

export default Theme;
