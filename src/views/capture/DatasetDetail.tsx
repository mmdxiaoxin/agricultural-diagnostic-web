import { createDataset, getDatasetDetail, updateDataset } from "@/api/modules";
import DatasetTransfer from "@/components/DatasetTransfer";
import { Button, Col, Form, Input, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from "./DatasetDetail.module.scss";

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
		<Row gutter={16} className={styles["container"]}>
			<Col span={6}>
				<Form
					form={form}
					layout="vertical"
					initialValues={{ id, name: "", description: "" }}
					onFinish={handleFinish}
				>
					<Form.Item
						label="数据集名称"
						name="name"
						rules={[{ required: true, message: "请输入数据集名称" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item label="数据集描述" name="description">
						<Input.TextArea />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">
							提交
						</Button>
					</Form.Item>
				</Form>
			</Col>
			<Col span={18}>
				<DatasetTransfer
					value={fileIds}
					onChange={newValue => {
						setFileIds(newValue as number[]);
					}}
				/>
			</Col>
		</Row>
	);
};

export default DatasetDetail;
