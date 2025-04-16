import welcome from "@/assets/images/welcome01.png";
import { useAppSelector } from "@/hooks";
import {
	AppstoreOutlined,
	BookOutlined,
	CloudOutlined,
	DatabaseOutlined,
	ExperimentOutlined,
	FileSearchOutlined,
	SettingOutlined,
	TeamOutlined,
	ToolOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const { Title, Paragraph, Text } = Typography;

const HomeIndex: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAppSelector(state => state.user);
	const isAdmin = user.roles?.find(role => role.name === "admin");
	const isExpert = user.roles?.find(role => role.name === "expert");

	const features = [
		{
			title: "数据采集",
			icon: <DatabaseOutlined className="text-2xl" />,
			description: "支持多种数据采集方式，包括图像、视频和传感器数据(暂未开放)",
			path: "/capture/dashboard",
			roles: ["expert", "admin"]
		},
		{
			title: "数据管理",
			icon: <AppstoreOutlined className="text-2xl" />,
			description: "高效管理您的农业数据，支持数据分类、标签和搜索",
			path: "/capture/manage",
			roles: ["user", "expert", "admin"]
		},
		{
			title: "病害诊断",
			icon: <ExperimentOutlined className="text-2xl" />,
			description: "基于AI的病害诊断系统，快速识别作物病害",
			path: "/diagnosis/history",
			roles: ["user", "expert", "admin"]
		},
		{
			title: "图片分析",
			icon: <FileSearchOutlined className="text-2xl" />,
			description: "专业的图像分析工具，支持多种图像处理功能",
			path: "/diagnosis/image",
			roles: ["user", "expert", "admin"]
		},
		{
			title: "模型管理",
			icon: <ToolOutlined className="text-2xl" />,
			description: "管理AI模型，支持模型训练、评估和部署",
			path: "/diagnosis/models",
			roles: ["expert", "admin"]
		},
		{
			title: "病害知识库",
			icon: <BookOutlined className="text-2xl" />,
			description: "丰富的病害知识库，包含详细的病害信息和防治方法",
			path: "/knowledge/preview",
			roles: ["user", "expert", "admin"]
		},
		{
			title: "系统配置",
			icon: <SettingOutlined className="text-2xl" />,
			description: "系统配置和管理，包括用户权限、系统参数等",
			path: "/setting/index",
			roles: ["user", "expert", "admin"]
		},
		{
			title: "用户管理",
			icon: <TeamOutlined className="text-2xl" />,
			description: "用户账户管理，支持用户注册、权限分配等",
			path: "/user/manage",
			roles: ["admin"]
		},
		{
			title: "诊断服务",
			icon: <CloudOutlined className="text-2xl" />,
			description: "管理诊断服务，配置诊断服务调用",
			path: "/service/manage",
			roles: ["expert", "admin"]
		}
	];

	const availableFeatures = features.filter(feature => {
		if (isAdmin) return true;
		if (isExpert) return feature.roles.includes("expert") || feature.roles.includes("user");
		return feature.roles.includes("user");
	});

	return (
		<div className={clsx("min-h-screen", "bg-gradient-to-b from-blue-50 to-white", "p-6")}>
			{/* 欢迎区域 */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className={clsx("max-w-7xl mx-auto", "py-12")}
			>
				<Row gutter={[24, 24]} align="middle">
					<Col xs={24} md={12}>
						<Space direction="vertical" size="large" className="w-full">
							<Title className={clsx("text-4xl md:text-5xl", "font-bold", "text-gray-800")}>
								农业智能诊断系统
							</Title>
							<Paragraph className={clsx("text-lg", "text-gray-600")}>
								基于人工智能的农业病害诊断平台，为农业生产提供智能化的解决方案。
								支持多种作物病害的快速识别和诊断，帮助农民及时防治病害，提高农业生产效率。
							</Paragraph>
							<Space>
								<Button
									type="primary"
									size="large"
									onClick={() => navigate("/diagnosis/image")}
									className={clsx(
										"rounded-lg",
										"px-6",
										"h-auto",
										"font-medium",
										"transition-all duration-300",
										"hover:-translate-y-1"
									)}
								>
									开始诊断
								</Button>
								<Button
									size="large"
									onClick={() => navigate("/knowledge/preview")}
									className={clsx(
										"rounded-lg",
										"px-6",
										"h-auto",
										"font-medium",
										"transition-all duration-300",
										"hover:-translate-y-1"
									)}
								>
									查看知识库
								</Button>
							</Space>
						</Space>
					</Col>
					<Col xs={24} md={12}>
						<motion.img
							src={welcome}
							alt="welcome"
							className={clsx("w-full", "h-auto", "max-w-lg", "mx-auto")}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						/>
					</Col>
				</Row>
			</motion.div>

			{/* 功能展示区域 */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className={clsx("max-w-7xl mx-auto", "py-12")}
			>
				<Title level={2} className="text-center mb-8">
					系统功能
				</Title>
				<Row gutter={[24, 24]}>
					{availableFeatures.map((feature, index) => (
						<Col xs={24} sm={12} md={8} lg={6} key={feature.title}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
							>
								<Card
									hoverable
									className={clsx(
										"h-full",
										"rounded-xl",
										"transition-all duration-300",
										"hover:shadow-lg",
										"hover:-translate-y-1"
									)}
									onClick={() => navigate(feature.path)}
								>
									<Space direction="vertical" size="middle" className="w-full">
										<div
											className={clsx(
												"flex items-center justify-center",
												"w-12 h-12",
												"rounded-full",
												"bg-blue-50",
												"text-blue-500"
											)}
										>
											{feature.icon}
										</div>
										<Title level={4} className="text-center mb-2">
											{feature.title}
										</Title>
										<Text type="secondary" className="text-center block">
											{feature.description}
										</Text>
									</Space>
								</Card>
							</motion.div>
						</Col>
					))}
				</Row>
			</motion.div>

			{/* 系统特点区域 */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className={clsx("bg-blue-50", "py-12")}
			>
				<div className={clsx("max-w-7xl mx-auto", "px-6")}>
					<Title level={2} className="text-center mb-8">
						系统特点
					</Title>
					<Row gutter={[24, 24]}>
						<Col xs={24} md={8}>
							<Card
								className={clsx(
									"h-full",
									"rounded-xl",
									"transition-all duration-300",
									"hover:shadow-lg",
									"hover:-translate-y-1"
								)}
							>
								<Space direction="vertical" size="middle">
									<Title level={4}>智能诊断</Title>
									<Text type="secondary">
										基于深度学习算法，快速准确地识别作物病害，提供专业的诊断建议。
									</Text>
								</Space>
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card
								className={clsx(
									"h-full",
									"rounded-xl",
									"transition-all duration-300",
									"hover:shadow-lg",
									"hover:-translate-y-1"
								)}
							>
								<Space direction="vertical" size="middle">
									<Title level={4}>知识库</Title>
									<Text type="secondary">
										丰富的病害知识库，包含详细的病害信息、防治方法和用药建议。
									</Text>
								</Space>
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card
								className={clsx(
									"h-full",
									"rounded-xl",
									"transition-all duration-300",
									"hover:shadow-lg",
									"hover:-translate-y-1"
								)}
							>
								<Space direction="vertical" size="middle">
									<Title level={4}>数据管理</Title>
									<Text type="secondary">
										完善的数据管理系统，支持数据采集、存储、分析和可视化。
									</Text>
								</Space>
							</Card>
						</Col>
					</Row>
				</div>
			</motion.div>
		</div>
	);
};

export default HomeIndex;
