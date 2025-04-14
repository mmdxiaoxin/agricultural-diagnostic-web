import { useEcharts } from "@/hooks/useEcharts";
import * as echarts from "echarts";
import { BasePrediction } from "@/api/interface/diagnosis";

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

	const option: echarts.EChartsOption = {
		tooltip: {
			trigger: "item",
			formatter: (params: any) => {
				const value = (params.value * 100).toFixed(2);
				return `${params.name}: ${value}%`;
			}
		},
		grid: {
			left: "3%",
			right: "25%",
			top: "3%",
			bottom: "3%",
			containLabel: true
		},
		legend: {
			orient: "vertical",
			right: "0",
			top: "center",
			width: "20%",
			itemGap: 20,
			textStyle: {
				fontSize: 12
			}
		},
		series: [
			{
				name: "预测概率",
				type: "pie",
				radius: ["40%", "70%"],
				center: ["40%", "50%"],
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
