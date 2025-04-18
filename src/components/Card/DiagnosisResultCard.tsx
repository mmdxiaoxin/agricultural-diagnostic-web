import { Prediction } from "@/api/interface/diagnosis";
import { DIAGNOSIS_CLASS_NAME_ZH_CN } from "@/constants/diagnosis";
import { Popover, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import { throttle } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import Top5ProbabilityChart from "../ECharts/Top5ProbabilityChart";

const { Text, Paragraph } = Typography;

interface DiagnosisResultCardProps {
	prediction: Prediction;
}

const DiagnosisResultCardContent = React.memo(({ prediction }: DiagnosisResultCardProps) => {
	const [hovered, setHovered] = useState(false);
	const [placement, setPlacement] = useState<"right" | "bottom">("right");

	useEffect(() => {
		const checkScreenSize = () => {
			setPlacement(window.innerWidth < 564 ? "bottom" : "right");
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);

		return () => {
			window.removeEventListener("resize", checkScreenSize);
		};
	}, []);

	const content =
		prediction.type === "classify" && prediction.top5 ? (
			<div className="max-w-[100vw] aspect-[5/3] h-[200px] lg:h-[300px] xl:h-[400px] p-2">
				<Top5ProbabilityChart predictions={prediction.top5} />
			</div>
		) : null;

	const handleHoverChange = (value: boolean) => {
		if (prediction.type === "classify") {
			setHovered(value);
		} else {
			setHovered(false);
		}
	};

	return (
		<motion.div
			whileHover={{ transform: "translateY(-2px)" }}
			className="bg-white p-2 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
		>
			<div className="flex items-center justify-between gap-1">
				<Text strong className="text-sm">
					{prediction.type === "classify" ? "分类" : "检测"}
				</Text>
				<Popover
					open={hovered}
					onOpenChange={handleHoverChange}
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
					placement={placement}
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
				{DIAGNOSIS_CLASS_NAME_ZH_CN[
					prediction.class_name as keyof typeof DIAGNOSIS_CLASS_NAME_ZH_CN
				] || prediction.class_name}
			</Paragraph>
		</motion.div>
	);
});

DiagnosisResultCardContent.displayName = "DiagnosisResultCardContent";

const DiagnosisResultCard = React.memo(({ prediction }: DiagnosisResultCardProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		if (!cardRef.current) return;

		const options = {
			root: null,
			rootMargin: "200px",
			threshold: 0.1
		};

		const handleIntersection = throttle((entries: IntersectionObserverEntry[]) => {
			const entry = entries[0];
			if (entry.isIntersecting) {
				setIsVisible(true);
				if (observerRef.current) {
					observerRef.current.unobserve(entry.target);
				}
			}
		}, 100);

		observerRef.current = new IntersectionObserver(handleIntersection, options);
		observerRef.current.observe(cardRef.current);

		return () => {
			if (observerRef.current && cardRef.current) {
				observerRef.current.unobserve(cardRef.current);
			}
		};
	}, []);

	return (
		<div ref={cardRef} style={{ minHeight: "80px" }}>
			{isVisible && <DiagnosisResultCardContent prediction={prediction} />}
		</div>
	);
});

DiagnosisResultCard.displayName = "DiagnosisResultCard";

export default DiagnosisResultCard;
