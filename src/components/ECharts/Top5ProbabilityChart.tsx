import { BasePrediction } from "@/api/interface/diagnosis";
import { useEcharts } from "@/hooks/useEcharts";
import { EChartsCoreOption } from "echarts/core";

export interface Top5ProbabilityChartProps {
	predictions?: BasePrediction[];
}

const Top5ProbabilityChart: React.FC<Top5ProbabilityChartProps> = ({
	predictions = [],
	...props
}) => {
	// 将预测结果转换为饼图数据格式
	const chartData = predictions.map(prediction => ({
		value: prediction.confidence,
		name: prediction.class_name
	}));

	const option: EChartsCoreOption = {
		tooltip: {
			trigger: "item",
			formatter: (params: any) => {
				const value = (params.value * 100).toFixed(2);
				return `${params.name}: ${value}%`;
			}
		},
		grid: {
			left: "3%",
			right: "3%",
			top: "3%",
			bottom: "3%",
			containLabel: true
		},
		legend: {
			orient: "vertical",
			right: "3%",
			top: "middle",
			width: "25%",
			itemGap: 10,
			textStyle: {
				fontSize: 12,
				overflow: "truncate",
				width: 80
			},
			formatter: (name: string) => {
				return name.length > 10 ? name.slice(0, 10) + "..." : name;
			}
		},
		series: [
			{
				name: "预测概率",
				type: "pie",
				radius: ["40%", "70%"],
				center: ["35%", "50%"],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: "#fff",
					borderWidth: 2
				},
				label: {
					show: false,
					position: "center"
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 20,
						fontWeight: "bold"
					}
				},
				labelLine: {
					show: false
				},
				data: chartData
			}
		]
	};

	const [echartsRef] = useEcharts(option, [predictions]);

	return <div ref={echartsRef} className="w-full h-full box-border" {...props} />;
};

export default Top5ProbabilityChart;
