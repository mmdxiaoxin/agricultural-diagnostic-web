import React, { Suspense } from "react";
import { Spin } from "antd";

/**
 * @description 路由懒加载
 * @param {Element} Comp 需要懒加载的组件
 * @param {Object} props 传递给懒加载组件的额外 props
 * @returns React节点
 */
const lazyLoad = (Comp: React.LazyExoticComponent<any>, props?: any): React.ReactNode => {
	return (
		<Suspense
			fallback={
				<Spin
					size="large"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%"
					}}
				/>
			}
		>
			<Comp {...props} />
		</Suspense>
	);
};

export default lazyLoad;
