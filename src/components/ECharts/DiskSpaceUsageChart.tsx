import { useEcharts } from "@/hooks/useEcharts";
import { formatSize } from "@/utils";
import * as echarts from "echarts";
import styles from "./index.module.scss";

export interface DiskSpaceUsageChartProps {
	usedSpace?: number; // 单位：字节（B）
	totalSpace?: number; // 单位：字节（B）
}

const DiskSpaceUsageChart: React.FC<DiskSpaceUsageChartProps> = ({
	usedSpace = 0,
	totalSpace = 1_000_000_000,
	...props
}) => {
	// 计算剩余空间（字节）
	const remainingSpaceInBytes = totalSpace - usedSpace;

	// 格式化显示
	const formattedUsedSpace = formatSize(usedSpace);
	const formattedTotalSpace = formatSize(totalSpace);
	// const formattedRemainingSpace = formatSize(remainingSpaceInBytes);

	let option: echarts.EChartsOption = {
		title: {
			text: "空间使用情况",
			subtext: `已用 ${formattedUsedSpace} / 总空间 ${formattedTotalSpace}`,
			left: "center",
			top: "center",
			textStyle: {
				fontSize: 16,
				fontWeight: "bold"
			}
		},
		tooltip: {
			trigger: "item",
			formatter: "{a} <br/>{b}: {c} ({d}%)"
		},
		series: [
			{
				name: "存储空间",
				type: "pie",
				radius: ["40%", "70%"], // 设置内外半径，使其成为环形图
				avoidLabelOverlap: false,
				label: {
					show: false,
					position: "center"
				},
				emphasis: {
					label: {
						show: true,
						fontSize: "20",
						fontWeight: "bold",
						color: "#fff"
					}
				},
				labelLine: {
					show: false
				},
				data: [
					{
						value: usedSpace / 1_000_000_000, // 转换为 GB 显示
						name: "已用空间",
						itemStyle: {
							color: "#FF5733" // 红色表示已用空间
						}
					},
					{
						value: remainingSpaceInBytes / 1_000_000_000, // 转换为 GB 显示
						name: "剩余空间",
						itemStyle: {
							color: "#33FF57" // 绿色表示剩余空间
						}
					}
				]
			}
		]
	};

	const [echartsRef] = useEcharts(option);

	return <div ref={echartsRef} className={styles["chart-container"]} {...props} />;
};

export default DiskSpaceUsageChart;
