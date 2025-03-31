import { Crop, Disease } from "@/api/interface/knowledge";
import { getCrops } from "@/api/modules/Knowledge/crop";
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Select, Space, Steps, Upload, message } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

export type DiseaseModalRef = {
	open: (mode: "edit" | "add", initialValues?: Disease) => void;
	close: () => void;
};

export type DiseaseModalProps = {
	onFinish: (values: Omit<Disease, "id" | "createdAt" | "updatedAt">) => void;
};

const DiseaseModal = forwardRef<DiseaseModalRef, DiseaseModalProps>(({ onFinish }, ref) => {
	const [visible, setVisible] = useState(false);
	const [mode, setMode] = useState<"edit" | "add">("add");
	const [currentStep, setCurrentStep] = useState(0);
	const [crops, setCrops] = useState<Crop[]>([]);
	const [diseaseId, setDiseaseId] = useState<number>(0);
	const [initLoading, setInitLoading] = useState(false);
	const [formData, setFormData] = useState<Omit<Disease, "id" | "createdAt" | "updatedAt">>();

	const [form] = Form.useForm();

	const steps = [
		{ title: "基本信息", description: "填写病害基础信息" },
		{ title: "症状特征", description: "添加症状描述" },
		{ title: "防治措施", description: "设置防治方案" },
		{ title: "环境因素", description: "配置环境条件" },
		...(mode === "edit" ? [{ title: "诊断规则", description: "设置诊断规则" }] : [])
	];

	useImperativeHandle(ref, () => ({
		open: (mode: "edit" | "add", initialValues?: Disease) => {
			setMode(mode);
			if (mode === "edit" && initialValues) {
				const { id, ...rest } = initialValues;
				setDiseaseId(id);
				form.setFieldsValue(rest);
				setFormData(rest);
			}
			setVisible(true);
		},
		close: () => {
			setVisible(false);
			form.resetFields();
			setCurrentStep(0);
		}
	}));

	const fetchCrops = async () => {
		setInitLoading(true);
		try {
			const res = await getCrops();
			setCrops(res.data || []);
		} catch (error) {
			console.error(error);
		} finally {
			setInitLoading(false);
		}
	};

	useEffect(() => {
		fetchCrops();
	}, []);

	const handleNext = async () => {
		try {
			const values = await form.validateFields();
			if (currentStep < steps.length - 1) {
				setFormData(prev => ({ ...prev, ...values }));
				setCurrentStep(currentStep + 1);
			} else {
				form.submit();
			}
		} catch (error) {
			message.error("请检查表单需求！");
		}
	};

	const handlePrev = () => {
		setCurrentStep(currentStep - 1);
	};

	const handleFinish = async (values: Omit<Disease, "id" | "createdAt" | "updatedAt">) => {
		try {
			const finalValues = { ...formData, ...values };
			if (mode === "edit") {
				console.log("edit", diseaseId, finalValues);
				onFinish(finalValues);
			} else {
				console.log("add", finalValues);
				onFinish(finalValues);
			}
			handleCancel();
		} catch (error) {
			message.error("请检查表单需求！");
		}
	};

	const handleCancel = () => {
		setVisible(false);
		form.resetFields();
		setCurrentStep(0);
	};

	const renderBasicInfo = () => (
		<div className="grid grid-cols-2 gap-4">
			<Form.Item
				name="name"
				label="病害名称"
				rules={[{ required: true, message: "请输入病害名称" }]}
			>
				<Input placeholder="请输入病害名称" />
			</Form.Item>

			<Form.Item name="alias" label="别名">
				<Input placeholder="请输入别名" />
			</Form.Item>

			<Form.Item
				name="cropId"
				label="所属作物"
				rules={[{ required: true, message: "请选择所属作物" }]}
			>
				<Select placeholder="请选择作物">
					{crops.map(crop => (
						<Option key={crop.id} value={crop.id}>
							{crop.name}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name="difficultyLevel" label="防治难度等级">
				<Select placeholder="请选择防治难度等级">
					<Option value="easy">简单</Option>
					<Option value="medium">中等</Option>
					<Option value="hard">困难</Option>
				</Select>
			</Form.Item>

			<Form.Item name="cause" label="病因" className="col-span-2">
				<TextArea rows={3} placeholder="请输入病因" />
			</Form.Item>

			<Form.Item name="transmission" label="传播方式" className="col-span-2">
				<TextArea rows={3} placeholder="请输入传播方式" />
			</Form.Item>
		</div>
	);

	const renderSymptoms = () => (
		<Form.List name="symptoms">
			{(fields, { add, remove }) => (
				<div className="space-y-4">
					{fields.map(({ key, name, ...restField }) => (
						<Card key={key} className="bg-gray-50">
							<div className="flex justify-between items-start mb-4">
								<h4 className="text-base font-medium">症状 {name + 1}</h4>
								<MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
							</div>
							<div className="space-y-4">
								<Form.Item
									{...restField}
									name={[name, "stage"]}
									label="发病阶段"
									rules={[{ required: true, message: "请输入发病阶段" }]}
								>
									<Input placeholder="请输入发病阶段" />
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, "description"]}
									label="症状描述"
									rules={[{ required: true, message: "请输入症状描述" }]}
								>
									<TextArea rows={3} placeholder="请输入症状描述" />
								</Form.Item>

								<Form.Item {...restField} name={[name, "imageUrl"]} label="症状图片">
									<Upload>
										<Button icon={<UploadOutlined />}>上传图片</Button>
									</Upload>
								</Form.Item>
							</div>
						</Card>
					))}
					<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
						添加症状
					</Button>
				</div>
			)}
		</Form.List>
	);

	const renderTreatments = () => (
		<Form.List name="treatments">
			{(fields, { add, remove }) => (
				<div className="space-y-4">
					{fields.map(({ key, name, ...restField }) => (
						<Card key={key} className="bg-gray-50">
							<div className="flex justify-between items-start mb-4">
								<h4 className="text-base font-medium">防治措施 {name + 1}</h4>
								<MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
							</div>
							<div className="space-y-4">
								<Form.Item
									{...restField}
									name={[name, "type"]}
									label="防治类型"
									rules={[{ required: true, message: "请选择防治类型" }]}
								>
									<Select placeholder="请选择防治类型">
										<Option value="chemical">化学防治</Option>
										<Option value="biological">生物防治</Option>
										<Option value="physical">物理防治</Option>
										<Option value="cultural">农业防治</Option>
									</Select>
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, "method"]}
									label="防治方法"
									rules={[{ required: true, message: "请输入防治方法" }]}
								>
									<TextArea rows={3} placeholder="请输入防治方法" />
								</Form.Item>

								<Form.Item {...restField} name={[name, "recommendedProducts"]} label="推荐药剂">
									<TextArea rows={2} placeholder="请输入推荐药剂" />
								</Form.Item>
							</div>
						</Card>
					))}
					<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
						添加防治措施
					</Button>
				</div>
			)}
		</Form.List>
	);

	const renderEnvironmentFactors = () => (
		<Form.List name="environmentFactors">
			{(fields, { add, remove }) => (
				<div className="space-y-4">
					{fields.map(({ key, name, ...restField }) => (
						<Card key={key} className="bg-gray-50">
							<div className="flex justify-between items-start mb-4">
								<h4 className="text-base font-medium">环境因素 {name + 1}</h4>
								<MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
							</div>
							<div className="space-y-4">
								<Form.Item
									{...restField}
									name={[name, "factor"]}
									label="环境因素"
									rules={[{ required: true, message: "请输入环境因素" }]}
								>
									<Input placeholder="请输入环境因素" />
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, "optimalRange"]}
									label="适宜范围"
									rules={[{ required: true, message: "请输入适宜范围" }]}
								>
									<Input placeholder="请输入适宜范围" />
								</Form.Item>
							</div>
						</Card>
					))}
					<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
						添加环境因素
					</Button>
				</div>
			)}
		</Form.List>
	);

	const renderDiagnosisRules = () => (
		<Form.List name="diagnosisRules">
			{(fields, { add, remove }) => (
				<div className="space-y-4">
					{fields.map(({ key, name, ...restField }) => (
						<Card key={key} className="bg-gray-50">
							<div className="flex justify-between items-start mb-4">
								<h4 className="text-base font-medium">诊断规则 {name + 1}</h4>
								<MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
							</div>
							<div className="space-y-4">
								<Form.Item
									{...restField}
									name={[name, "symptomIds"]}
									label="相关症状"
									rules={[{ required: true, message: "请选择相关症状" }]}
								>
									<Select mode="multiple" placeholder="请选择相关症状">
										{/* 这里需要从symptoms中获取选项 */}
									</Select>
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, "probability"]}
									label="诊断概率"
									rules={[{ required: true, message: "请输入诊断概率" }]}
								>
									<Input type="number" min={0} max={100} placeholder="请输入诊断概率(0-100)" />
								</Form.Item>

								<Form.Item
									{...restField}
									name={[name, "recommendedAction"]}
									label="建议措施"
									rules={[{ required: true, message: "请输入建议措施" }]}
								>
									<TextArea rows={3} placeholder="请输入建议措施" />
								</Form.Item>
							</div>
						</Card>
					))}
					<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
						添加诊断规则
					</Button>
				</div>
			)}
		</Form.List>
	);

	const renderContent = () => {
		switch (currentStep) {
			case 0:
				return renderBasicInfo();
			case 1:
				return renderSymptoms();
			case 2:
				return renderTreatments();
			case 3:
				return renderEnvironmentFactors();
			case 4:
				return mode === "edit" ? renderDiagnosisRules() : null;
			default:
				return null;
		}
	};

	return (
		<Modal
			title={mode === "edit" ? "编辑病害信息" : "新增病害信息"}
			open={visible}
			onCancel={handleCancel}
			loading={initLoading}
			width={1200}
			footer={null}
			style={{ top: 20 }}
		>
			<div className="mb-6">
				<Steps current={currentStep} items={steps} />
			</div>

			<Form form={form} layout="vertical" className="space-y-4" onFinish={handleFinish}>
				<div className="min-h-[400px] max-h-[600px] overflow-y-auto px-4">{renderContent()}</div>

				<div className="flex justify-between mt-6 pt-4 border-t">
					<Button onClick={handleCancel}>取消</Button>
					<Space>
						{currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>}
						<Button type="primary" onClick={handleNext}>
							{currentStep === steps.length - 1 ? "完成" : "下一步"}
						</Button>
					</Space>
				</div>
			</Form>
		</Modal>
	);
});

export default DiseaseModal;
