import { Disease } from "@/api/interface/knowledge/disease";
import { getSymptomImage } from "@/api/modules/Knowledge/symptom";
import { TREATMENT_METHOD } from "@/constants/knowledge";
import {
	BookOutlined,
	EnvironmentOutlined,
	ExclamationCircleOutlined,
	MedicineBoxOutlined
} from "@ant-design/icons";
import { Button, Card, Image, Space, Spin, Tabs, Tag, Typography } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import qs from "qs";
import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";

const { Title, Paragraph } = Typography;

interface KnowledgePreviewContentProps {
	selectedDisease: Disease | null;
	loading: boolean;
}

const KnowledgePreviewContent: React.FC<KnowledgePreviewContentProps> = ({
	selectedDisease,
	loading
}) => {
	const [exporting, setExporting] = useState(false);
	const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
	const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
	const previewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (selectedDisease?.symptoms) {
			selectedDisease.symptoms.forEach(symptom => {
				loadSymptomImage(symptom.id);
			});
		}
	}, [selectedDisease]);

	const handleExportPDF = async () => {
		if (!selectedDisease || !previewRef.current) return;

		setExporting(true);
		try {
			// 动态导入 PDF 相关库
			const [html2canvas, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

			// 创建一个临时的导出容器
			const exportContainer = document.createElement("div");
			exportContainer.style.width = "800px";
			exportContainer.style.padding = "20px";
			exportContainer.style.backgroundColor = "white";

			// 添加标题和基本信息
			const header = document.createElement("div");
			header.innerHTML = `
				<h1 style="font-size: 24px; margin-bottom: 10px;">${selectedDisease.name}</h1>
				<div style="margin-bottom: 20px;">
					<span style="background-color: #e6f7ff; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
						${selectedDisease.crop?.name}
					</span>
					<span style="color: #666;">${selectedDisease.alias}</span>
				</div>
			`;
			exportContainer.appendChild(header);

			// 添加基本信息
			const basicInfo = document.createElement("div");
			basicInfo.innerHTML = `
				<h2 style="font-size: 18px; margin: 20px 0 10px;">基本信息</h2>
				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 16px; margin-bottom: 5px;">病因</h3>
					<p style="margin: 0;">${selectedDisease.cause || "暂无数据"}</p>
				</div>
				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 16px; margin-bottom: 5px;">传播方式</h3>
					<p style="margin: 0;">${selectedDisease.transmission || "暂无数据"}</p>
				</div>
			`;
			exportContainer.appendChild(basicInfo);

			// 添加症状特征
			const symptoms = document.createElement("div");
			symptoms.innerHTML = `
				<h2 style="font-size: 18px; margin: 20px 0 10px;">症状特征</h2>
				<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
					${selectedDisease.symptoms
						.map(
							symptom => `
						<div style="border: 1px solid #eee; padding: 15px; border-radius: 8px;">
							<h3 style="font-size: 16px; margin-bottom: 10px;">${symptom.stage}</h3>
							<p style="margin: 0; color: #666;">${symptom.description}</p>
						</div>
					`
						)
						.join("")}
				</div>
			`;
			exportContainer.appendChild(symptoms);

			// 添加防治措施
			const treatments = document.createElement("div");
			treatments.innerHTML = `
				<h2 style="font-size: 18px; margin: 20px 0 10px;">防治措施</h2>
				${selectedDisease.treatments
					.map(
						treatment => `
					<div style="margin-bottom: 15px;">
						<h3 style="font-size: 16px; margin-bottom: 5px;">${TREATMENT_METHOD[treatment.type]}</h3>
						<p style="margin: 0;">${treatment.method}</p>
						${
							treatment.recommendedProducts
								? `
							<p style="margin: 5px 0 0; color: #666;">
								推荐产品：${treatment.recommendedProducts}
							</p>
						`
								: ""
						}
					</div>
				`
					)
					.join("")}
			`;
			exportContainer.appendChild(treatments);

			// 添加环境因素
			const environment = document.createElement("div");
			environment.innerHTML = `
				<h2 style="font-size: 18px; margin: 20px 0 10px;">环境因素</h2>
				<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
					${selectedDisease.environmentFactors
						.map(
							factor => `
						<div style="border: 1px solid #eee; padding: 15px; border-radius: 8px;">
							<h3 style="font-size: 16px; margin-bottom: 5px;">${factor.factor}</h3>
							<p style="margin: 0; color: #666;">适宜范围：${factor.optimalRange}</p>
						</div>
					`
						)
						.join("")}
				</div>
			`;
			exportContainer.appendChild(environment);

			// 将容器添加到文档中
			document.body.appendChild(exportContainer);

			// 使用动态导入的库
			const canvas = await html2canvas.default(exportContainer, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				logging: false
			});

			// 从文档中移除临时容器
			document.body.removeChild(exportContainer);

			const imgData = canvas.toDataURL("image/jpeg", 1.0);
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4"
			});

			const imgWidth = 210; // A4纸宽度
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;
			let position = 0;

			pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
			heightLeft -= 297; // A4纸高度

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
				heightLeft -= 297;
			}

			pdf.save(`${selectedDisease.name}.pdf`);
			message.success("PDF导出成功");
		} catch (error) {
			console.error("导出PDF失败:", error);
			message.error("PDF导出失败");
		} finally {
			setExporting(false);
		}
	};

	const handleDiagnosis = () => {
		if (!selectedDisease) return;

		const searchUrl = `https://www.bing.com/search?${qs.stringify({
			form: "QBLH",
			q: selectedDisease.name
		})}`;

		Modal.confirm({
			title: "诊断建议",
			content: "是否要查看该病害的更多诊断建议？",
			okText: "查看",
			cancelText: "取消",
			onOk: () => {
				window.open(searchUrl, "_blank");
			}
		});
	};

	const loadSymptomImage = async (symptomId: number) => {
		if (imageUrls[symptomId]) return;
		const imageUrl = selectedDisease?.symptoms.find(symptom => symptom.id === symptomId)?.imageUrl;
		if (
			!imageUrl ||
			!imageUrl.match(
				/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?|^oss:\/\/[^/]+$/
			)
		)
			return;

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
				<div className="space-y-4 lg:space-y-6">
					<div>
						<Title level={4} className="text-base lg:text-lg">
							病因
						</Title>
						<Paragraph className="text-sm lg:text-base">{selectedDisease?.cause}</Paragraph>
					</div>
					<div>
						<Title level={4} className="text-base lg:text-lg">
							传播方式
						</Title>
						<Paragraph className="text-sm lg:text-base">{selectedDisease?.transmission}</Paragraph>
					</div>
				</div>
			)
		},
		{
			key: "2",
			label: "症状特征",
			children: (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
					{selectedDisease?.symptoms.map(symptom => (
						<Card
							key={symptom.id}
							className="hover:shadow-lg transition-shadow h-full flex flex-col"
							size="small"
						>
							<div className="relative w-full aspect-[3/2] mb-2 lg:mb-4">
								{imageLoading[symptom.id] ? (
									<div className="w-full h-full flex items-center justify-center">
										<Spin size="small" />
									</div>
								) : imageUrls[symptom.id] ? (
									<Image
										src={imageUrls[symptom.id]}
										alt="病害症状"
										className="w-full h-full object-contain rounded-lg bg-gray-50 p-1 lg:p-2"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
										<ExclamationCircleOutlined className="text-xl lg:text-2xl text-gray-400" />
									</div>
								)}
							</div>
							<div className="flex-1">
								<Title level={5} className="text-sm lg:text-base mb-1 lg:mb-2">
									{symptom.stage}
								</Title>
								<Paragraph className="text-xs lg:text-sm text-gray-600 line-clamp-3">
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
				<div className="space-y-4 lg:space-y-6">
					{selectedDisease?.treatments.map(treatment => (
						<div key={treatment.id}>
							<Title level={4} className="text-base lg:text-lg">
								{TREATMENT_METHOD[treatment.type]}
							</Title>
							<Paragraph className="text-sm lg:text-base">{treatment.method}</Paragraph>
							{treatment.recommendedProducts && (
								<div className="mt-1 lg:mt-2">
									<span className="text-sm lg:text-base font-medium">推荐产品：</span>
									<span className="text-sm lg:text-base">{treatment.recommendedProducts}</span>
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
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6 min-h-[80px]">
					{selectedDisease?.environmentFactors.map(factor => (
						<Card key={factor.id} className="hover:shadow-lg transition-shadow" size="small">
							<Space direction="vertical" className="w-full">
								<div className="flex items-center">
									<EnvironmentOutlined className="text-blue-500 mr-2 text-sm lg:text-base" />
									<span className="text-sm lg:text-base font-medium">{factor.factor}</span>
								</div>
								<div className="text-xs lg:text-sm text-gray-600">
									适宜范围：{factor.optimalRange}
								</div>
							</Space>
						</Card>
					))}
				</div>
			)
		}
	];

	return (
		<motion.div
			key={selectedDisease?.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={clsx(
				"lg:flex-1",
				"rounded-2xl",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
			ref={previewRef}
		>
			{loading ? (
				<div className="flex h-full items-center justify-center">
					<Spin size="large" />
				</div>
			) : selectedDisease ? (
				<div className="p-4 lg:p-6">
					<div
						className={clsx(
							"flex flex-col gap-4 lg:gap-6",
							"mb-4 lg:mb-6 p-4 lg:p-6",
							"rounded-2xl",
							"bg-white",
							"shadow-sm",
							"border border-gray-100",
							"transition-all duration-300",
							"hover:shadow-md"
						)}
					>
						<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
							<div className="flex flex-col gap-2">
								<Title level={3} className="text-xl lg:text-2xl">
									{selectedDisease.name}
								</Title>
								<div className="flex items-center gap-2">
									<Tag color="blue" className="text-xs lg:text-sm">
										{selectedDisease.crop?.name}
									</Tag>
									<span className="text-xs lg:text-sm text-gray-500">{selectedDisease.alias}</span>
								</div>
							</div>
							<Space className="flex-wrap">
								<Button
									icon={<BookOutlined />}
									loading={exporting}
									onClick={handleExportPDF}
									size="small"
								>
									导出PDF
								</Button>
								<Button
									type="primary"
									icon={<MedicineBoxOutlined />}
									onClick={handleDiagnosis}
									disabled={!selectedDisease}
									size="small"
								>
									诊断建议
								</Button>
							</Space>
						</div>
					</div>

					<div
						className={clsx(
							"flex flex-col gap-4 lg:gap-6",
							"mb-4 lg:mb-6 p-4 lg:p-6",
							"rounded-2xl",
							"bg-white",
							"shadow-sm",
							"border border-gray-100",
							"transition-all duration-300",
							"hover:shadow-md"
						)}
					>
						<Tabs defaultActiveKey="1" items={tabItems} size="small" />
					</div>
				</div>
			) : (
				<div className="flex h-64 lg:h-full items-center justify-center">
					<div className="text-center">
						<BookOutlined className="text-4xl lg:text-6xl text-gray-300 mb-4" />
						<p className="text-sm lg:text-base text-gray-500">请先选择病害然后进行预览</p>
					</div>
				</div>
			)}
		</motion.div>
	);
};

export default KnowledgePreviewContent;
