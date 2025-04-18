import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisList, { DiagnosisListRef } from "@/components/List/DiagnosisList";
import PageHeader from "@/components/PageHeader";
import { Col, Row } from "antd";
import clsx from "clsx";
import { useRef } from "react";

const ImageDiagnosis = () => {
	const diagnosisListRef = useRef<DiagnosisListRef>(null);

	const handlePredict = (_: File) => {
		diagnosisListRef.current?.init();
	};

	return (
		<div
			className={clsx(
				"h-full w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<PageHeader title="植物病害诊断" description="上传植物图片进行智能诊断" />

			<Row gutter={12} className="flex-1 min-h-0">
				<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="h-full">
					<div
						className={clsx(
							"h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6",
							"overflow-y-auto",
							"[&::-webkit-scrollbar]:hidden",
							"[-ms-overflow-style:none]",
							"[scrollbar-width:none]"
						)}
					>
						<DiseaseDiagnose onPredict={handlePredict} />
					</div>
				</Col>
				<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="h-full">
					<div
						className={clsx(
							"h-full bg-white rounded-2xl shadow-sm border border-gray-100",
							"lg:overflow-y-auto",
							"[&::-webkit-scrollbar]:hidden",
							"[-ms-overflow-style:none]",
							"[scrollbar-width:none]"
						)}
					>
						<DiagnosisList ref={diagnosisListRef} />
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default ImageDiagnosis;
