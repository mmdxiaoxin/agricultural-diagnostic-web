import { createDataset, getDatasetDetail, updateDataset } from "@/api/modules";
import DatasetTransfer from "@/components/DatasetTransfer";
import { Button, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import clsx from "clsx";
import { ArrowLeftOutlined } from "@ant-design/icons";

export type DatasetDetailProps = {
	mode?: "create" | "edit";
};

const DatasetDetail: React.FC<DatasetDetailProps> = ({ mode }) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [form] = Form.useForm();
	const [fileIds, setFileIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchDataset = async (id: number) => {
		setLoading(true);
		try {
			const response = await getDatasetDetail(id);

			if (response.code !== 200 || !response.data) throw new Error(response.message);

			form.setFieldsValue(response.data);
			setFileIds(response.data.fileIds);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (mode === "edit" && id) {
			fetchDataset(Number(id));
		}
	}, [id, mode]);

	const handleFinish = async (values: any) => {
		setLoading(true);
		try {
			if (mode === "create") {
				await createDataset({ ...values, fileIds });
				message.success("数据集创建成功");
				navigate("/capture/dataset");
			} else {
				await updateDataset(Number(id), { ...values, fileIds });
				message.success("数据集更新成功");
				navigate("/capture/dataset");
			}
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
			form.resetFields();
		}
	};

	const handleBack = () => {
		navigate("/capture/dataset");
	};

	return (
		<div
			className={clsx(
				" w-full",
				"p-6",
				"rounded-2xl",
				"flex flex-col",
				"bg-gradient-to-br from-white to-gray-50"
			)}
		>
			<div
				className={clsx(
					"flex flex-col gap-6",
					"mb-6 p-6",
					"rounded-2xl",
					"bg-white",
					"shadow-sm",
					"border border-gray-100",
					"transition-all duration-300",
					"hover:shadow-md"
				)}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-4">
						<Button
							type="text"
							icon={<ArrowLeftOutlined />}
							onClick={handleBack}
							className="text-gray-500 hover:text-blue-500"
						>
							返回
						</Button>
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold text-gray-800">
								{mode === "create" ? "创建数据集" : "编辑数据集"}
							</h2>
							<p className="text-gray-500">
								{mode === "create" ? "创建新的数据集" : "修改现有数据集信息"}
							</p>
						</div>
					</div>
				</div>

				<Form
					form={form}
					layout="vertical"
					initialValues={{ id, name: "", description: "" }}
					onFinish={handleFinish}
					className="w-full"
				>
					<Form.Item
						label="数据集名称"
						name="name"
						rules={[{ required: true, message: "请输入数据集名称" }]}
						className="mb-6"
					>
						<Input showCount maxLength={25} className="rounded-lg" placeholder="请输入数据集名称" />
					</Form.Item>
					<Form.Item label="数据集描述" name="description" className="mb-6">
						<Input.TextArea
							showCount
							maxLength={100}
							className="rounded-lg"
							placeholder="请输入数据集描述"
							rows={4}
						/>
					</Form.Item>
					<Form.Item label="选择文件" name="fileIds" className="mb-6" required>
						<div className="w-full">
							<DatasetTransfer
								value={fileIds}
								onChange={newValue => {
									setFileIds(newValue as number[]);
								}}
							/>
						</div>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							className={clsx(
								"px-8 h-10",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							{mode === "create" ? "创建数据集" : "保存修改"}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default DatasetDetail;
