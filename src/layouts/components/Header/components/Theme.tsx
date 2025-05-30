// import SwitchDark from "@/components/SwitchDark";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { setCollapse } from "@/store/modules/menuSlice";
import { AppstoreOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Divider, Drawer, Switch } from "antd";
import React, { useState } from "react";
import clsx from "clsx";

const Theme: React.FC = () => {
	const [visible, setVisible] = useState<boolean>(false);

	const { themeConfig } = useAppSelector(state => state.global);
	const { breadcrumb, tabs, footer } = themeConfig;
	const { isCollapse } = useAppSelector(state => state.menu);

	const dispatch = useAppDispatch();

	// // 设置灰色模式或色弱模式
	// const setWeakOrGray = (checked: boolean, theme: string) => {
	// 	dispatch(setThemeConfig({ ...themeConfig, weakOrGray: checked ? theme : "" }));
	// };

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
			<Button
				type="text"
				className={clsx(
					"mr-[22px] text-[19px] leading-[19px] cursor-pointer text-[rgba(0,0,0,0.85)]"
				)}
				icon={<AppstoreOutlined />}
				onClick={() => setVisible(true)}
			/>
			<Drawer
				title="布局设置"
				closable={false}
				onClose={() => setVisible(false)}
				open={visible}
				width={320}
			>
				<div
					className={clsx(
						"[&_.theme-item]:flex [&_.theme-item]:items-center [&_.theme-item]:justify-between [&_.theme-item]:my-[25px]",
						"[&_.theme-item_span]:text-[14px]",
						"[&_.theme-item_.ant-switch]:w-[46px]",
						"[&_.divider]:mb-[22px] [&_.divider]:text-[15px]",
						"[&_.divider_.ant-icon]:mr-[10px]",
						"[&_.ant-divider-with-text::before]:border-t [&_.ant-divider-with-text::before]:border-solid [&_.ant-divider-with-text::before]:border-[#dcdfe6]",
						"[&_.ant-divider-with-text::after]:border-t [&_.ant-divider-with-text::after]:border-solid [&_.ant-divider-with-text::after]:border-[#dcdfe6]"
					)}
				>
					{/* 全局主题
					<Divider className={"divider"}>
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
					<br /> */}
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
				</div>
			</Drawer>
		</>
	);
};

export default Theme;
