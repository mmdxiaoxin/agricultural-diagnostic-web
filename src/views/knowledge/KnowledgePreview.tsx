import React, { useState } from "react";
import { Card, Tabs, Tag, Typography, Image, Space, Button } from "antd";
import { BookOutlined, EnvironmentOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import clsx from "clsx";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface DiseaseDetail {
	id: number;
	name: string;
	alias: string;
	crop: {
		name: string;
	};
	cause: string;
	transmission: string;
	symptoms: Array<{
		id: number;
		description: string;
		imageUrl: string;
		stage: string;
	}>;
	treatments: Array<{
		id: number;
		type: "chemical" | "biological" | "physical" | "cultural";
		method: string;
		recommendedProducts: string;
	}>;
	environmentFactors: Array<{
		id: number;
		factor: string;
		optimalRange: string;
	}>;
}

const KnowledgePreview: React.FC = () => {
	const [disease, setDisease] = useState<DiseaseDetail | null>(null);
	const [loading, setLoading] = useState(false);

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
			<div
				className={clsx(
					"flex flex-col gap-6",
					"mb-6 p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<div className="flex justify-between items-center">
					<Title level={3}>病害知识库预览</Title>
					<Space>
						<Button icon={<BookOutlined />}>导出PDF</Button>
						<Button type="primary" icon={<MedicineBoxOutlined />}>
							诊断建议
						</Button>
					</Space>
				</div>
			</div>

			<div
				className={clsx(
					"flex flex-col gap-6",
					"mb-6 p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<Tabs defaultActiveKey="1">
					<TabPane tab="基本信息" key="1">
						<div className="space-y-6">
							<div>
								<Title level={4}>病害名称</Title>
								<Space>
									<span className="text-xl font-medium">稻瘟病</span>
									<Tag color="blue">水稻</Tag>
								</Space>
							</div>

							<div>
								<Title level={4}>病因</Title>
								<Paragraph>
									稻瘟病是由稻瘟病菌（Magnaporthe
									oryzae）引起的一种真菌性病害。该病害在高温高湿条件下容易发生，特别是在雨季和灌溉条件良好的地区。
								</Paragraph>
							</div>

							<div>
								<Title level={4}>传播方式</Title>
								<Paragraph>
									稻瘟病主要通过以下方式传播： 1. 种子传播 2. 病株残体传播 3. 气流传播 4. 灌溉水传播
								</Paragraph>
							</div>
						</div>
					</TabPane>

					<TabPane tab="症状特征" key="2">
						<div className="grid grid-cols-2 gap-6">
							{[1, 2, 3].map(item => (
								<Card key={item} className="hover:shadow-lg transition-shadow">
									<Image
										src="https://example.com/disease-image.jpg"
										alt="病害症状"
										className="w-full h-48 object-cover rounded-lg mb-4"
									/>
									<Title level={5}>苗期症状</Title>
									<Paragraph>
										幼苗叶片出现褐色斑点，逐渐扩大形成不规则病斑，严重时导致幼苗死亡。
									</Paragraph>
								</Card>
							))}
						</div>
					</TabPane>

					<TabPane tab="防治措施" key="3">
						<div className="space-y-6">
							<div>
								<Title level={4}>农业防治</Title>
								<Paragraph>1. 选用抗病品种 2. 合理密植 3. 科学施肥 4. 及时清除病株</Paragraph>
							</div>

							<div>
								<Title level={4}>化学防治</Title>
								<Paragraph>
									1. 使用三环唑等药剂进行种子处理 2. 发病初期喷施稻瘟灵等药剂 3.
									注意轮换用药，防止抗性产生
								</Paragraph>
							</div>
						</div>
					</TabPane>

					<TabPane tab="环境因素" key="4">
						<div className="grid grid-cols-2 gap-6">
							{[
								{ factor: "温度", range: "25-30℃" },
								{ factor: "湿度", range: "85-95%" },
								{ factor: "光照", range: "弱光" },
								{ factor: "土壤pH", range: "5.5-6.5" }
							].map(item => (
								<Card key={item.factor} className="hover:shadow-lg transition-shadow">
									<Space direction="vertical" className="w-full">
										<div className="flex items-center">
											<EnvironmentOutlined className="text-blue-500 mr-2" />
											<span className="font-medium">{item.factor}</span>
										</div>
										<div className="text-gray-600">适宜范围：{item.range}</div>
									</Space>
								</Card>
							))}
						</div>
					</TabPane>
				</Tabs>
			</div>
		</div>
	);
};

export default KnowledgePreview;
