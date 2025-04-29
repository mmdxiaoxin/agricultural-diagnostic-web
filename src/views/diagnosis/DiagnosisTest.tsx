import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisHistoryList, {
	DiagnosisHistoryListRef
} from "@/components/List/DiagnosisHistoryList";
import PageHeader from "@/components/PageHeader";
import { Col, Row } from "antd";
import clsx from "clsx";
import { useRef } from "react";

const DiagnosisTest = () => {
	const diagnosisListRef = useRef<DiagnosisHistoryListRef>(null);

	const handlePredict = (_: File) => {
		diagnosisListRef.current?.init();
	};

	return (
		<div
			className={clsx(
				"md:h-full w-full",
				"md:p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50",
				"overflow-y-auto"
			)}
		>
			<PageHeader title="诊断服务测试" description="上传图片测试诊断服务" />

			<Row gutter={12} className="flex-1 min-h-0">
				<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="h-full">
					<div
						className={clsx(
							"h-full bg-white rounded-2xl shadow-sm md:border border-gray-100",
							"overflow-y-auto",
							"[&::-webkit-scrollbar]:hidden",
							"[-ms-overflow-style:none]",
							"[scrollbar-width:none]"
						)}
					>
						<DiseaseDiagnose onPredict={handlePredict} type="test" />
					</div>
				</Col>
				<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="h-full">
					<div
						className={clsx(
							"h-full bg-white rounded-2xl shadow-sm md:border border-gray-100",
							"lg:overflow-y-auto",
							"[&::-webkit-scrollbar]:hidden",
							"[-ms-overflow-style:none]",
							"[scrollbar-width:none]"
						)}
					>
						<DiagnosisHistoryList ref={diagnosisListRef} />
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default DiagnosisTest;
