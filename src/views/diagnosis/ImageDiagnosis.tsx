import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisList, { DiagnosisListRef } from "@/components/List/DiagnosisList";
import { Col, Row } from "antd";
import clsx from "clsx";
import { useRef } from "react";

const ImageDiagnosis = () => {
	const diagnosisListRef = useRef<DiagnosisListRef>(null);

	const handlePredict = (_: File) => {
		diagnosisListRef.current?.init();
	};

	return (
		<Row gutter={12} className={clsx("w-full h-full", "bg-white rounded-lg overflow-y-auto")}>
			<Col
				xs={24}
				sm={24}
				md={24}
				lg={12}
				xl={12}
				xxl={12}
				className={clsx(
					"overflow-y-auto",
					"[&::-webkit-scrollbar]:hidden", // 隐藏 Webkit 浏览器的滚动条
					"[-ms-overflow-style:none]", // 隐藏 IE 的滚动条
					"[scrollbar-width:none]" // 隐藏 Firefox 的滚动条
				)}
			>
				<DiseaseDiagnose onPredict={handlePredict} />
			</Col>
			<Col
				xs={24}
				sm={24}
				md={24}
				lg={12}
				xl={12}
				xxl={12}
				className={clsx(
					"h-full",
					"lg:overflow-y-auto",
					"[&::-webkit-scrollbar]:hidden", // 隐藏 Webkit 浏览器的滚动条
					"[-ms-overflow-style:none]", // 隐藏 IE 的滚动条
					"[scrollbar-width:none]", // 隐藏 Firefox 的滚动条
					"lg:border-r lg:border-gray-200" // 在大屏幕时添加右侧边框
				)}
			>
				<DiagnosisList ref={diagnosisListRef} />
			</Col>
		</Row>
	);
};

export default ImageDiagnosis;
