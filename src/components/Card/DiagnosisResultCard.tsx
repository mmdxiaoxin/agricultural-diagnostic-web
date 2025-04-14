import { Tag, Typography } from "antd";
import { Prediction } from "@/api/interface/diagnosis";
import React from "react";

const { Text, Paragraph } = Typography;

interface DiagnosisResultCardProps {
	prediction: Prediction;
}

const DiagnosisResultCard = React.memo(({ prediction }: DiagnosisResultCardProps) => {
	return (
		<div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between gap-1">
				<Text strong className="text-sm">
					{prediction.type === "classify" ? "分类" : "检测"}
				</Text>
				<Tag color="blue" className="text-xs">
					{(prediction.confidence * 100).toFixed(2)}%
				</Tag>
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
		</div>
	);
});

DiagnosisResultCard.displayName = "DiagnosisResultCard";

export default DiagnosisResultCard;
