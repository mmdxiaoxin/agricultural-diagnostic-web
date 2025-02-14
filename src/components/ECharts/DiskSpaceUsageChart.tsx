import { useEcharts } from "@/hooks/useEcharts";
import * as echarts from "echarts";
import styles from "./index.module.scss";

export interface DiskSpaceUsageChartProps {
	usedSpace?: number; // 单位：字节（B）
	totalSpace?: number; // 单位：字节（B）
}

const DiskSpaceUsageChart: React.FC<DiskSpaceUsageChartProps> = ({
	usedSpace = 0,
	totalSpace = 1_000_000_000, // 默认值为 1GB
	...props
}) => {
	// 计算剩余空间（字节）
	const usedSpaceInMB = usedSpace / 1_000_000;
	const remainingSpaceInMB = (totalSpace - usedSpace) / 1_000_000;

	let option: echarts.EChartsOption = {
		tooltip: {
			trigger: "item",
			formatter: "{a} <br/>{b}: {c} MB ({d}%)",
			textStyle: {
				fontSize: 16
			}
		},
		series: [
			{
				name: "存储空间",
				type: "pie",
				radius: ["40%", "70%"], // 设置内外半径，使其成为环形图
				padAngle: 5,
				itemStyle: {
					borderRadius: 5
				},
				avoidLabelOverlap: false,
				label: {
					show: true,
					position: "center",
					formatter: `{d}%`, // 显示占用百分比
					fontSize: 16,
					fontWeight: "bold",
					color: "#333" // 文字颜色
				},
				emphasis: {
					label: {
						show: true,
						fontSize: "20",
						fontWeight: "bold",
						color: "#1890ff"
					}
				},
				labelLine: {
					show: false
				},
				data: [
					{
						value: usedSpaceInMB,
						name: "已用空间",
						itemStyle: {
							color: "#1890ff"
						}
					},
					{
						value: remainingSpaceInMB,
						name: "剩余空间",
						itemStyle: {
							color: "#81b2ff"
						},
						label: {
							show: false
						}
					}
				]
			}
		]
	};

	const [echartsRef] = useEcharts(option, [usedSpaceInMB, remainingSpaceInMB]);

	return <div ref={echartsRef} className={styles["chart-container"]} {...props} />;
};

export default DiskSpaceUsageChart;
