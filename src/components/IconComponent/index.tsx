import React from "react";

// 使用到的 antd-icon 组件
export const Icons = {
	HomeFilled: React.lazy(() => import("@ant-design/icons/HomeFilled")),
	TableOutlined: React.lazy(() => import("@ant-design/icons/TableOutlined")),
	AppstoreOutlined: React.lazy(() => import("@ant-design/icons/AppstoreOutlined")),
	ProfileOutlined: React.lazy(() => import("@ant-design/icons/ProfileOutlined")),
	TeamOutlined: React.lazy(() => import("@ant-design/icons/TeamOutlined"))
} as const;

export type IconComponentProps = {
	name: keyof typeof Icons;
};
const IconComponent: React.FC<IconComponentProps> = ({ name }) => {
	// 动态加载 Icon
	const DynamicIcon = Icons[name] ?? null;
	return <React.Suspense fallback={null}>{DynamicIcon && <DynamicIcon />}</React.Suspense>;
};

export default IconComponent;
