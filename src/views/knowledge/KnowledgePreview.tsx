import { Disease } from "@/api/interface/knowledge/disease";
import { getCrops } from "@/api/modules/Knowledge/crop";
import { getDiseaseDetail } from "@/api/modules/Knowledge/disease";
import { getKnowledgeList } from "@/api/modules/Knowledge/knowledge";
import KnowledgePreviewContent from "@/components/KnowledgePreviewContent";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, List, message, Pagination, Select, Space, Tag } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const KnowledgePreview: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
	const [loading, setLoading] = useState(false);
	const [diseaseList, setDiseaseList] = useState<Disease[]>([]);
	const [searchText, setSearchText] = useState("");
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
		// 更新URL参数
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("id", disease.id.toString());
		setSearchParams(newSearchParams);
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

	return (
		<div className="flex flex-col lg:flex-row lg:h-full w-full gap-2 overflow-y-auto">
			{/* 病害列表区域 */}
			<motion.div
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				className={clsx(
					"w-full lg:w-80",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"p-4 lg:p-6",
					"h-auto lg:h-full",
					"overflow-hidden",
					"flex flex-col",
					"mb-4 lg:mb-0",
					"min-h-[400px]"
				)}
			>
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl lg:text-2xl font-semibold text-gray-800">病害列表</h2>
						<p className="text-sm lg:text-base text-gray-500">共 {total} 个病害</p>
					</div>
					<Space direction="vertical" className="w-full">
						<Select
							placeholder="选择作物类型"
							className="w-full"
							allowClear
							showSearch
							optionFilterProp="children"
							filterOption={(input, option) =>
								(option?.label as string).toLowerCase().includes(input.toLowerCase())
							}
							onChange={value => setSelectedCropId(value)}
						>
							{crops.map(crop => (
								<Select.Option key={crop.id} value={crop.id} label={crop.name}>
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
					className="flex-1 overflow-y-auto mt-4 min-h-[200px]"
					dataSource={diseaseList}
					loading={loading}
					renderItem={item => (
						<List.Item
							className={clsx(
								"cursor-pointer rounded-lg p-2 lg:p-3",
								"hover:bg-gray-50",
								"transition-colors duration-200",
								selectedDisease?.id === item.id && "bg-blue-50"
							)}
							onClick={() => handleDiseaseSelect(item)}
						>
							<div className="flex flex-col w-full p-2">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm lg:text-base font-medium">{item.name}</span>
									<Tag color="blue" className="text-xs lg:text-sm">
										{item.crop?.name}
									</Tag>
								</div>
								<span className="text-xs lg:text-sm text-gray-500">{item.alias}</span>
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
						size="small"
						className="text-xs lg:text-sm"
					/>
				</div>
			</motion.div>

			{/* 预览区域 */}
			<KnowledgePreviewContent selectedDisease={selectedDisease} loading={loading} />
		</div>
	);
};

export default KnowledgePreview;
