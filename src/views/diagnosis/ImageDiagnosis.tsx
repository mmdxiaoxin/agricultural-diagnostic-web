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
		<Row gutter={12} className="w-full h-full bg-white rounded-lg">
			<Col
				span={12}
				className={clsx(
					"h-full",
					"overflow-y-auto",
					"[&::-webkit-scrollbar]:hidden", // 隐藏 Webkit 浏览器的滚动条
					"[-ms-overflow-style:none]", // 隐藏 IE 的滚动条
					"[scrollbar-width:none]" // 隐藏 Firefox 的滚动条
				)}
			>
				<DiagnosisList ref={diagnosisListRef} />
			</Col>
			<Col
				span={12}
				className={clsx(
					"h-full",
					"overflow-y-auto",
					"[&::-webkit-scrollbar]:hidden", // 隐藏 Webkit 浏览器的滚动条
					"[-ms-overflow-style:none]", // 隐藏 IE 的滚动条
					"[scrollbar-width:none]" // 隐藏 Firefox 的滚动条
				)}
			>
				<DiseaseDiagnose onPredict={handlePredict} />
			</Col>
		</Row>
	);
};

export default ImageDiagnosis;
