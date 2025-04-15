import { Disease } from "@/api/interface/knowledge/disease";
import { getKnowledge } from "@/api/modules/Knowledge/knowledge";
import { TREATMENT_METHOD } from "@/constants/knowledge";
import {
	BookOutlined,
	EnvironmentOutlined,
	MedicineBoxOutlined,
	SearchOutlined
} from "@ant-design/icons";
import { Button, Card, Image, Input, List, Space, Spin, Tabs, Tag, Typography } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const KnowledgePreview: React.FC = () => {
	const [searchParams] = useSearchParams();
	const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
	const [loading, setLoading] = useState(false);
	const [diseaseList, setDiseaseList] = useState<Disease[]>([]);
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		fetchDiseaseList();
	}, []);

	useEffect(() => {
		const diseaseId = searchParams.get("id");
		if (diseaseId && diseaseList.length > 0) {
			const disease = diseaseList.find(d => d.id === parseInt(diseaseId));
			if (disease) {
				setSelectedDisease(disease);
			}
		}
	}, [diseaseList, searchParams]);

	const fetchDiseaseList = async () => {
		setLoading(true);
		try {
			const res = await getKnowledge();
			setDiseaseList(res.data || []);
		} catch (error) {
			console.error("获取病害列表失败:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDiseaseSelect = (disease: Disease) => {
		setSelectedDisease(disease);
	};

	const filteredDiseaseList = diseaseList.filter(
		disease =>
			disease.name.toLowerCase().includes(searchText.toLowerCase()) ||
			disease.alias.toLowerCase().includes(searchText.toLowerCase())
	);

	return (
		<div className="flex h-full w-full gap-2">
			{/* 病害列表区域 */}
			<motion.div
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				className={clsx(
					"w-80",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"p-6",
					"h-full",
					"overflow-hidden",
					"flex flex-col"
				)}
			>
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold text-gray-800">病害列表</h2>
						<p className="text-gray-500">共 {diseaseList.length} 个病害</p>
					</div>
					<Input
						prefix={<SearchOutlined />}
						placeholder="搜索病害名称"
						value={searchText}
						onChange={e => setSearchText(e.target.value)}
						className="rounded-lg"
					/>
				</div>
				<List
					className="flex-1 overflow-y-auto mt-4"
					dataSource={filteredDiseaseList}
					loading={loading}
					renderItem={item => (
						<List.Item
							className={clsx(
								"cursor-pointer rounded-lg p-3",
								"hover:bg-gray-50",
								"transition-colors duration-200",
								selectedDisease?.id === item.id && "bg-blue-50"
							)}
							onClick={() => handleDiseaseSelect(item)}
						>
							<div className="flex flex-col w-full p-2">
								<div className="flex justify-between items-center mb-2">
									<span className="font-medium">{item.name}</span>
									<Tag color="blue">{item.crop?.name}</Tag>
								</div>
								<span className="text-sm text-gray-500">{item.alias}</span>
							</div>
						</List.Item>
					)}
				/>
			</motion.div>

			{/* 预览区域 */}
			<motion.div
				key={selectedDisease?.id}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={clsx(
					"flex-1",
					"rounded-2xl",
					"bg-gradient-to-br from-white to-gray-50",
					"overflow-y-auto"
				)}
			>
				{loading ? (
					<div className="flex h-full items-center justify-center">
						<Spin size="large" />
					</div>
				) : selectedDisease ? (
					<div className="p-6">
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
								<div className="flex flex-col gap-2">
									<Title level={3}>{selectedDisease.name}</Title>
									<div className="flex items-center gap-2">
										<Tag color="blue">{selectedDisease.crop?.name}</Tag>
										<span className="text-gray-500">{selectedDisease.alias}</span>
									</div>
								</div>
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
											<Title level={4}>病因</Title>
											<Paragraph>{selectedDisease.cause}</Paragraph>
										</div>

										<div>
											<Title level={4}>传播方式</Title>
											<Paragraph>{selectedDisease.transmission}</Paragraph>
										</div>
									</div>
								</TabPane>

								<TabPane tab="症状特征" key="2">
									<div className="grid grid-cols-2 gap-6">
										{selectedDisease.symptoms.map(symptom => (
											<Card key={symptom.id} className="hover:shadow-lg transition-shadow">
												<Image
													src={symptom.imageUrl}
													alt="病害症状"
													className="w-full h-48 object-cover rounded-lg mb-4"
												/>
												<Title level={5}>{symptom.stage}</Title>
												<Paragraph>{symptom.description}</Paragraph>
											</Card>
										))}
									</div>
								</TabPane>

								<TabPane tab="防治措施" key="3">
									<div className="space-y-6">
										{selectedDisease.treatments.map(treatment => (
											<div key={treatment.id}>
												<Title level={4}>{TREATMENT_METHOD[treatment.type]}</Title>
												<Paragraph>{treatment.method}</Paragraph>
												{treatment.recommendedProducts && (
													<div className="mt-2">
														<span className="font-medium">推荐产品：</span>
														<span>{treatment.recommendedProducts}</span>
													</div>
												)}
											</div>
										))}
									</div>
								</TabPane>

								<TabPane tab="环境因素" key="4">
									<div className="grid grid-cols-2 gap-6">
										{selectedDisease.environmentFactors.map(factor => (
											<Card key={factor.id} className="hover:shadow-lg transition-shadow">
												<Space direction="vertical" className="w-full">
													<div className="flex items-center">
														<EnvironmentOutlined className="text-blue-500 mr-2" />
														<span className="font-medium">{factor.factor}</span>
													</div>
													<div className="text-gray-600">适宜范围：{factor.optimalRange}</div>
												</Space>
											</Card>
										))}
									</div>
								</TabPane>
							</Tabs>
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<BookOutlined className="text-6xl text-gray-300 mb-4" />
							<p className="text-gray-500">请从左侧选择病害进行预览</p>
						</div>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default KnowledgePreview;
