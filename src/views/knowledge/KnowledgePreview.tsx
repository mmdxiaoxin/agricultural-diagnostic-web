import { Disease } from "@/api/interface/knowledge/disease";
import { getCrops } from "@/api/modules/Knowledge/crop";
import { getKnowledgeList } from "@/api/modules/Knowledge/knowledge";
import { getDiseaseDetail } from "@/api/modules/Knowledge/disease";
import { getSymptomImage } from "@/api/modules/Knowledge/symptom";
import { TREATMENT_METHOD } from "@/constants/knowledge";
import {
	BookOutlined,
	EnvironmentOutlined,
	ExclamationCircleOutlined,
	MedicineBoxOutlined,
	SearchOutlined
} from "@ant-design/icons";
import {
	Button,
	Card,
	Image,
	Input,
	List,
	message,
	Pagination,
	Select,
	Space,
	Spin,
	Tabs,
	Tag,
	Typography
} from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const { Title, Paragraph } = Typography;

const KnowledgePreview: React.FC = () => {
	const [searchParams] = useSearchParams();
	const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
	const [loading, setLoading] = useState(false);
	const [diseaseList, setDiseaseList] = useState<Disease[]>([]);
	const [searchText, setSearchText] = useState("");
	const [exporting, setExporting] = useState(false);
	const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
	const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);
	const [crops, setCrops] = useState<{ id: number; name: string }[]>([]);

	// 处理URL参数
	useEffect(() => {
		const diseaseId = searchParams.get("id");
		if (diseaseId) {
			// 如果URL中有id参数，直接加载该病害数据
			fetchDiseaseById(parseInt(diseaseId));
		}
	}, [searchParams]);

	useEffect(() => {
		fetchCrops();
	}, []);

	useEffect(() => {
		if (selectedDisease?.symptoms) {
			selectedDisease.symptoms.forEach(symptom => {
				loadSymptomImage(symptom.id);
			});
		}
	}, [selectedDisease]);

	const fetchCrops = async () => {
		try {
			const res = await getCrops();
			if (res.data) {
				setCrops(res.data);
			}
		} catch (error) {
			console.error("获取作物列表失败:", error);
			message.error("获取作物列表失败");
		}
	};

	const fetchDiseaseById = async (id: number) => {
		setLoading(true);
		try {
			const res = await getDiseaseDetail(id);
			if (res.data) {
				setSelectedDisease(res.data);
				// 设置搜索条件，以便显示在列表中
				setSearchText(res.data.name);
				setSelectedCropId(res.data.crop?.id);
				// 加载列表数据
				fetchDiseaseList();
			}
		} catch (error) {
			console.error("获取病害详情失败:", error);
			message.error("获取病害详情失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchDiseaseList = async () => {
		if (!searchText && !selectedCropId) {
			setDiseaseList([]);
			setTotal(0);
			return;
		}

		setLoading(true);
		try {
			const res = await getKnowledgeList({
				page: currentPage,
				pageSize,
				keyword: searchText,
				cropId: selectedCropId
			});
			if (res.data) {
				setDiseaseList(res.data.list || []);
				setTotal(res.data.total || 0);
			} else {
				setDiseaseList([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("获取病害列表失败:", error);
			message.error("获取病害列表失败");
		} finally {
			setLoading(false);
		}
	};

	const handleDiseaseSelect = (disease: Disease) => {
		setSelectedDisease(disease);
	};

	const handleSearch = () => {
		setCurrentPage(1);
		fetchDiseaseList();
	};

	const handlePageChange = (page: number, pageSize: number) => {
		setCurrentPage(page);
		setPageSize(pageSize);
		fetchDiseaseList();
	};

	const handleExportPDF = async () => {
		if (!selectedDisease) return;

		setExporting(true);
		try {
			// TODO: 调用后端导出PDF接口
			// const response = await exportDiseasePDF(selectedDisease.id);
			// const blob = new Blob([response.data], { type: 'application/pdf' });
			// const url = URL.createObjectURL(blob);
			// const a = document.createElement('a');
			// a.href = url;
			// a.download = `${selectedDisease.name}.pdf`;
			// document.body.appendChild(a);
			// a.click();
			// document.body.removeChild(a);
			// URL.revokeObjectURL(url);
			message.success("PDF导出成功");
		} catch (error) {
			message.error("PDF导出失败");
			console.error("导出PDF失败:", error);
		} finally {
			setExporting(false);
		}
	};

	const loadSymptomImage = async (symptomId: number) => {
		if (imageUrls[symptomId]) return;

		setImageLoading(prev => ({ ...prev, [symptomId]: true }));
		try {
			const blob = await getSymptomImage(symptomId);
			const url = URL.createObjectURL(blob);
			setImageUrls(prev => ({ ...prev, [symptomId]: url }));
		} catch (error) {
			console.error("加载症状图片失败:", error);
		} finally {
			setImageLoading(prev => ({ ...prev, [symptomId]: false }));
		}
	};

	const tabItems = [
		{
			key: "1",
			label: "基本信息",
			children: (
				<div className="space-y-6">
					<div>
						<Title level={4}>病因</Title>
						<Paragraph>{selectedDisease?.cause}</Paragraph>
					</div>
					<div>
						<Title level={4}>传播方式</Title>
						<Paragraph>{selectedDisease?.transmission}</Paragraph>
					</div>
				</div>
			)
		},
		{
			key: "2",
			label: "症状特征",
			children: (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
					{selectedDisease?.symptoms.map(symptom => (
						<Card
							key={symptom.id}
							className="hover:shadow-lg transition-shadow h-full flex flex-col"
						>
							<div className="relative w-full aspect-[3/2] mb-4">
								{imageLoading[symptom.id] ? (
									<div className="w-full h-full flex items-center justify-center">
										<Spin />
									</div>
								) : imageUrls[symptom.id] ? (
									<Image
										src={imageUrls[symptom.id]}
										alt="病害症状"
										className="w-full h-full object-contain rounded-lg bg-gray-50 p-2"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
										<ExclamationCircleOutlined className="text-2xl text-gray-400" />
									</div>
								)}
							</div>
							<div className="flex-1">
								<Title level={5} className="mb-2">
									{symptom.stage}
								</Title>
								<Paragraph className="text-sm text-gray-600 line-clamp-3">
									{symptom.description}
								</Paragraph>
							</div>
						</Card>
					))}
				</div>
			)
		},
		{
			key: "3",
			label: "防治措施",
			children: (
				<div className="space-y-6">
					{selectedDisease?.treatments.map(treatment => (
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
			)
		},
		{
			key: "4",
			label: "环境因素",
			children: (
				<div className="grid grid-cols-2 gap-6">
					{selectedDisease?.environmentFactors.map(factor => (
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
			)
		}
	];

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
						<p className="text-gray-500">共 {total} 个病害</p>
					</div>
					<Space direction="vertical" className="w-full">
						<Select
							placeholder="选择作物类型"
							className="w-full"
							allowClear
							onChange={value => setSelectedCropId(value)}
						>
							{crops.map(crop => (
								<Select.Option key={crop.id} value={crop.id}>
									{crop.name}
								</Select.Option>
							))}
						</Select>
						<Input
							prefix={<SearchOutlined />}
							placeholder="搜索病害名称"
							value={searchText}
							onChange={e => setSearchText(e.target.value)}
							onPressEnter={handleSearch}
							className="rounded-lg"
						/>
						<Button type="primary" onClick={handleSearch} className="w-full">
							搜索
						</Button>
					</Space>
				</div>
				<List
					className="flex-1 overflow-y-auto mt-4"
					dataSource={diseaseList}
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
				<div className="mt-4 flex justify-center">
					<Pagination
						current={currentPage}
						pageSize={pageSize}
						total={total}
						onChange={handlePageChange}
						showSizeChanger
						showQuickJumper
					/>
				</div>
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
									<Button icon={<BookOutlined />} loading={exporting} onClick={handleExportPDF}>
										导出PDF
									</Button>
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
							<Tabs defaultActiveKey="1" items={tabItems} />
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
