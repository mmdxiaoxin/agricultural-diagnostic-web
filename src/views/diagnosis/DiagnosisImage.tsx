import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisHistoryList, {
	DiagnosisHistoryListRef
} from "@/components/List/DiagnosisHistoryList";
import PageHeader from "@/components/PageHeader";
import { Col, Row, Tour } from "antd";
import type { TourProps } from "antd";
import clsx from "clsx";
import { useRef, useState } from "react";

const DiagnosisImage = () => {
	const diagnosisListRef = useRef<DiagnosisHistoryListRef>(null);
	const [open, setOpen] = useState<boolean>(false);

	const handlePredict = (_: File) => {
		diagnosisListRef.current?.init();
	};

	const steps: TourProps['steps'] = [
		{
			title: '选择诊断支持',
			description: '在这里选择您需要的诊断支持类型',
			target: () => document.querySelector('.ant-select') as HTMLElement,
		},
		{
			title: '上传图片',
			description: '您可以通过文件上传或拍照的方式上传植物图片',
			target: () => document.querySelector('.ant-upload') as HTMLElement,
		},
		{
			title: '开始检测',
			description: '点击按钮开始进行植物病害诊断',
			target: () => document.querySelector('.ant-btn-primary') as HTMLElement,
		},
		{
			title: '诊断历史',
			description: '这里可以查看您的历史诊断记录',
			target: () => document.querySelector('.ant-list') as HTMLElement,
		},
	];

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
			<PageHeader 
				title="植物病害诊断" 
				description="上传植物图片进行智能诊断"
				onHelpClick={() => setOpen(true)}
			/>

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
						<DiseaseDiagnose onPredict={handlePredict} />
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

			<Tour
				open={open}
				onClose={() => setOpen(false)}
				steps={steps}
				type="primary"
			/>
		</div>
	);
};

export default DiagnosisImage;
