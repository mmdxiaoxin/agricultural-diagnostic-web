import DiseaseDiagnose from "@/components/DiseaseDiagnose";
import DiagnosisHistoryList, {
	DiagnosisHistoryListRef
} from "@/components/List/DiagnosisHistoryList";
import PageHeader from "@/components/PageHeader";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { markDiagnosisTestTourShown } from "@/store/modules/tourSlice";
import type { TourProps } from "antd";
import { Col, Row, Tour } from "antd";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

const DiagnosisTest: React.FC = () => {
	const dispatch = useAppDispatch();
	const hasShownTour = useAppSelector(state => state.tour.hasShownDiagnosisTestTour);
	const diagnosisListRef = useRef<DiagnosisHistoryListRef>(null);
	const [open, setOpen] = useState<boolean>(false);

	// 添加 ref 用于 Tour
	const serviceRef = useRef<HTMLDivElement>(null);
	const uploadRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// 首次访问时自动显示 Tour
	useEffect(() => {
		if (!hasShownTour) {
			setTimeout(() => {
				setOpen(true);
			}, 500);
		}
	}, [hasShownTour]);

	const handlePredict = (_: File) => {
		diagnosisListRef.current?.init();
	};

	const handleTourClose = () => {
		setOpen(false);
		dispatch(markDiagnosisTestTourShown());
	};

	const steps: TourProps["steps"] = [
		{
			title: "选择诊断服务",
			description: "在这里选择要测试的诊断服务和配置",
			target: () => serviceRef.current as HTMLElement
		},
		{
			title: "上传图片",
			description: "您可以通过文件上传或拍照的方式上传植物图片",
			target: () => uploadRef.current as HTMLElement
		},
		{
			title: "开始检测",
			description: "点击按钮开始进行诊断服务测试",
			target: () => buttonRef.current as HTMLElement
		},
		{
			title: "诊断历史",
			description: "这里可以查看您的历史诊断记录",
			target: () => listRef.current as HTMLElement
		}
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
				title="诊断服务测试"
				description="上传图片测试诊断服务"
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
						<DiseaseDiagnose
							onPredict={handlePredict}
							type="test"
							selectRef={serviceRef}
							uploadRef={uploadRef}
							buttonRef={buttonRef}
						/>
					</div>
				</Col>
				<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="h-full">
					<div
						ref={listRef}
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

			<Tour open={open} onClose={handleTourClose} steps={steps} />
		</div>
	);
};

export default DiagnosisTest;
