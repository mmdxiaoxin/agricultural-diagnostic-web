import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Select, Space, Upload } from "antd";
import React, { forwardRef, useImperativeHandle } from "react";

const { Option } = Select;
const { TextArea } = Input;

export type DiseaseModalRef = {
	open: (mode: "edit" | "add", initialValues?: any) => void;
	close: () => void;
};

export type DiseaseModalProps = {
	onFinish: (values: any) => void;
};

const DiseaseModal = forwardRef<DiseaseModalRef, DiseaseModalProps>(({ onFinish }, ref) => {
	const [visible, setVisible] = React.useState(false);
	const [mode, setMode] = React.useState<"edit" | "add">("add");
	const [initialValues, setInitialValues] = React.useState<any>({});

	useImperativeHandle(ref, () => ({
		open: (mode: "edit" | "add", initialValues?: any) => {
			setMode(mode);
			if (initialValues) {
				setInitialValues(initialValues);
			}
			setVisible(true);
		},
		close: () => setVisible(false)
	}));

	return (
		<Modal
			title={mode === "edit" ? "编辑病害信息" : "新增病害信息"}
			open={visible}
			onCancel={() => setVisible(false)}
			footer={null}
		>
			<Form
				layout="vertical"
				onFinish={onFinish}
				initialValues={initialValues}
				className="space-y-6"
			>
				<Card title="基本信息" className="shadow-sm">
					<div className="grid grid-cols-2 gap-6">
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
								<Option value="1">水稻</Option>
								<Option value="2">小麦</Option>
								<Option value="3">玉米</Option>
							</Select>
						</Form.Item>

						<Form.Item name="cause" label="病因">
							<TextArea rows={4} placeholder="请输入病因" />
						</Form.Item>

						<Form.Item name="transmission" label="传播方式" className="col-span-2">
							<TextArea rows={4} placeholder="请输入传播方式" />
						</Form.Item>
					</div>
				</Card>

				<Card title="症状特征" className="shadow-sm">
					<Form.List name="symptoms">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Card key={key} className="mb-4">
										<Space direction="vertical" className="w-full">
											<div className="flex justify-between items-center">
												<Form.Item
													{...restField}
													name={[name, "stage"]}
													label="发病阶段"
													rules={[{ required: true, message: "请输入发病阶段" }]}
												>
													<Input placeholder="请输入发病阶段" />
												</Form.Item>
												<MinusCircleOutlined onClick={() => remove(name)} />
											</div>

											<Form.Item
												{...restField}
												name={[name, "description"]}
												label="症状描述"
												rules={[{ required: true, message: "请输入症状描述" }]}
											>
												<TextArea rows={4} placeholder="请输入症状描述" />
											</Form.Item>

											<Form.Item {...restField} name={[name, "imageUrl"]} label="症状图片">
												<Upload>
													<Button icon={<UploadOutlined />}>上传图片</Button>
												</Upload>
											</Form.Item>
										</Space>
									</Card>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										添加症状
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Card>

				<Card title="防治措施" className="shadow-sm">
					<Form.List name="treatments">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Card key={key} className="mb-4">
										<Space direction="vertical" className="w-full">
											<div className="flex justify-between items-center">
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
												<MinusCircleOutlined onClick={() => remove(name)} />
											</div>

											<Form.Item
												{...restField}
												name={[name, "method"]}
												label="防治方法"
												rules={[{ required: true, message: "请输入防治方法" }]}
											>
												<TextArea rows={4} placeholder="请输入防治方法" />
											</Form.Item>

											<Form.Item
												{...restField}
												name={[name, "recommendedProducts"]}
												label="推荐药剂"
											>
												<TextArea rows={2} placeholder="请输入推荐药剂" />
											</Form.Item>
										</Space>
									</Card>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										添加防治措施
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Card>

				<Card title="环境因素" className="shadow-sm">
					<Form.List name="environmentFactors">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Card key={key} className="mb-4">
										<Space direction="vertical" className="w-full">
											<div className="flex justify-between items-center">
												<Form.Item
													{...restField}
													name={[name, "factor"]}
													label="环境因素"
													rules={[{ required: true, message: "请输入环境因素" }]}
												>
													<Input placeholder="请输入环境因素" />
												</Form.Item>
												<MinusCircleOutlined onClick={() => remove(name)} />
											</div>

											<Form.Item
												{...restField}
												name={[name, "optimalRange"]}
												label="适宜范围"
												rules={[{ required: true, message: "请输入适宜范围" }]}
											>
												<Input placeholder="请输入适宜范围" />
											</Form.Item>
										</Space>
									</Card>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										添加环境因素
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Card>
			</Form>
		</Modal>
	);
});

export default DiseaseModal;
