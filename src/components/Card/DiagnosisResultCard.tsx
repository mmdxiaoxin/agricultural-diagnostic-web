import { Tag, Typography, Popover } from "antd";
import { Prediction } from "@/api/interface/diagnosis";
import React from "react";
import Top5ProbabilityChart from "../ECharts/Top5ProbabilityChart";
import { motion } from "framer-motion";

const { Text, Paragraph } = Typography;

interface DiagnosisResultCardProps {
	prediction: Prediction;
}

const DiagnosisResultCard = React.memo(({ prediction }: DiagnosisResultCardProps) => {
	const content =
		prediction.type === "classify" && prediction.top5 ? (
			<div className="w-[300px] h-[300px] p-2">
				<Top5ProbabilityChart predictions={prediction.top5} />
			</div>
		) : null;

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			className="bg-white p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
		>
			<div className="flex items-center justify-between gap-1">
				<Text strong className="text-sm">
					{prediction.type === "classify" ? "分类" : "检测"}
				</Text>
				<Popover
					content={content}
					title={
						<div className="flex items-center gap-2">
							<span className="text-base font-medium">Top5预测结果分布</span>
							<Tag color="blue" className="text-xs">
								{(prediction.confidence * 100).toFixed(2)}%
							</Tag>
						</div>
					}
					trigger="hover"
					placement="right"
					className="top5-probability-popover"
					style={{
						boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
					}}
				>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Tag
							color="blue"
							className="text-xs cursor-pointer hover:opacity-80 transition-opacity px-2 py-1"
						>
							{(prediction.confidence * 100).toFixed(2)}%
						</Tag>
					</motion.div>
				</Popover>
			</div>
			<Paragraph
				copyable
				ellipsis={{
					rows: 1,
					expandable: true
				}}
				className="mt-0.5 text-gray-700 text-sm"
			>
				{prediction.class_name}
			</Paragraph>
		</motion.div>
	);
});

DiagnosisResultCard.displayName = "DiagnosisResultCard";

export default DiagnosisResultCard;
