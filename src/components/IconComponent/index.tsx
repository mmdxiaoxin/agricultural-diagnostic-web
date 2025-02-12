import React from "react";

// 使用到的 antd-icon 组件
export const Icons = {
	HomeOutlined: React.lazy(() => import("@ant-design/icons/HomeOutlined")),
	HomeFilled: React.lazy(() => import("@ant-design/icons/HomeFilled")),
	TableOutlined: React.lazy(() => import("@ant-design/icons/TableOutlined")),
	AppstoreOutlined: React.lazy(() => import("@ant-design/icons/AppstoreOutlined")),
	ProfileOutlined: React.lazy(() => import("@ant-design/icons/ProfileOutlined")),
	TeamOutlined: React.lazy(() => import("@ant-design/icons/TeamOutlined")),
	DatabaseOutlined: React.lazy(() => import("@ant-design/icons/DatabaseOutlined")),
	DashboardOutlined: React.lazy(() => import("@ant-design/icons/DashboardOutlined")),
	FileZipOutlined: React.lazy(() => import("@ant-design/icons/FileZipOutlined")),
	ExperimentOutlined: React.lazy(() => import("@ant-design/icons/ExperimentOutlined")),
	FileImageOutlined: React.lazy(() => import("@ant-design/icons/FileImageOutlined")),
	UploadOutlined: React.lazy(() => import("@ant-design/icons/UploadOutlined")),
	DownloadOutlined: React.lazy(() => import("@ant-design/icons/DownloadOutlined")),
	FileOutlined: React.lazy(() => import("@ant-design/icons/FileOutlined")),
	VideoCameraOutlined: React.lazy(() => import("@ant-design/icons/VideoCameraOutlined"))
} as const;

export type IconComponentProps = {
	name: keyof typeof Icons;
	color?: string;
	size?: number;
};
const IconComponent: React.FC<IconComponentProps> = ({ name, color, size }) => {
	// 动态加载 Icon
	const DynamicIcon = Icons[name] ?? null;
	return (
		<React.Suspense fallback={null}>
			{DynamicIcon && <DynamicIcon style={{ color, fontSize: size }} />}
		</React.Suspense>
	);
};

export default IconComponent;
