import { createDataset, getDatasetDetail, updateDataset } from "@/api/modules";
import DatasetTransfer from "@/components/DatasetTransfer";
import { Button, Form, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export type DatasetDetailProps = {
	mode?: "create" | "edit";
};

const DatasetDetail: React.FC<DatasetDetailProps> = ({ mode }) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [form] = Form.useForm();

	const [fileIds, setFileIds] = useState<number[]>([]);

	const fetchDataset = async (id: number) => {
		try {
			const response = await getDatasetDetail(id);

			if (response.code !== 200 || !response.data) throw new Error(response.message);

			form.setFieldsValue(response.data);
			setFileIds(response.data.fileIds);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	useEffect(() => {
		if (mode === "edit" && id) {
			fetchDataset(Number(id));
		}
	}, [id, mode]);

	const handleFinish = async (values: any) => {
		try {
			if (mode === "create") {
				await createDataset({ ...values, fileIds });
				navigate("/capture/dataset");
				message.success("数据集创建成功");
			} else {
				await updateDataset(Number(id), { ...values, fileIds });
				navigate("/capture/dataset");
				message.success("数据集更新成功");
			}
		} catch (error: any) {
			message.error(error.message);
		} finally {
			form.resetFields();
		}
	};

	return (
		<div className="w-full h-full relative bg-white rounded-lg p-6 overflow-y-scroll">
			<Form
				form={form}
				layout="inline"
				initialValues={{ id, name: "", description: "" }}
				className=" sm:h-24 md:h-24 lg:h-12"
				onFinish={handleFinish}
			>
				<Form.Item
					label="数据集名称"
					name="name"
					rules={[{ required: true, message: "请输入数据集名称" }]}
				>
					<Input showCount maxLength={25} />
				</Form.Item>
				<Form.Item label="数据集描述" name="description">
					<Input showCount maxLength={100} />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						提交
					</Button>
				</Form.Item>
			</Form>
			<div>
				<DatasetTransfer
					value={fileIds}
					onChange={newValue => {
						setFileIds(newValue as number[]);
					}}
				/>
			</div>
		</div>
	);
};

export default DatasetDetail;
