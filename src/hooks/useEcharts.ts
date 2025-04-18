import { EChartsCoreOption, EChartsType, init, use } from "echarts/core";
import { useEffect, useRef } from "react";
// 按需引入图表组件
import { PieChart } from "echarts/charts";
// 按需引入组件
import {
	GridComponent,
	LegendComponent,
	TitleComponent,
	TooltipComponent
} from "echarts/components";
// 引入渲染器
import { CanvasRenderer } from "echarts/renderers";

// 注册必须的组件
const registerComponents = () => {
	use([PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);
};

// 确保组件只注册一次
registerComponents();

/**
 * @description 使用Echarts(只是为了添加图表响应式)
 * @param {Element} data 数据
 * @param {Object} options 绘制Echarts的参数(必传)
 * @return chart
 * */
export const useEcharts = (options: EChartsCoreOption, data?: any) => {
	const myChart = useRef<EChartsType>();
	const echartsRef = useRef<HTMLDivElement>(null);

	const echartsResize = () => {
		echartsRef && myChart?.current?.resize();
	};

	useEffect(() => {
		if (data?.length !== 0) {
			myChart?.current?.setOption(options);
		}
	}, [data]);

	useEffect(() => {
		if (echartsRef?.current) {
			myChart.current = init(echartsRef.current as HTMLDivElement, undefined, {
				renderer: "canvas",
				useDirtyRect: false
			});
		}
		myChart?.current?.setOption(options);
		window.addEventListener("resize", echartsResize, false);
		return () => {
			window.removeEventListener("resize", echartsResize);
			myChart?.current?.dispose();
		};
	}, []);

	return [echartsRef];
};
