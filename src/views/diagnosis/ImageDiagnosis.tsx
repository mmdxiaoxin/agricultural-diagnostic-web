import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisList from "@/components/List/DiagnosisList";
import { Col, Row } from "antd";
import clsx from "clsx";

const ImageDiagnosis = () => {
	return (
		<Row className="w-full h-full">
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
				<DiseaseDiagnose />
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
				<DiagnosisList />
			</Col>
		</Row>
	);
};

export default ImageDiagnosis;
