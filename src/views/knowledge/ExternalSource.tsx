import React from "react";

const ExternalSource: React.FC = () => {
	return (
		<div style={{ width: "100%", height: "100vh", position: "relative" }}>
			<iframe
				src="https://cloud.sinoverse.cn/index_bch.html"
				title="农业病虫害数据中心"
				style={{
					width: "100%",
					height: "100%",
					border: "none"
				}}
				loading="lazy"
			/>
		</div>
	);
};

export default ExternalSource;
