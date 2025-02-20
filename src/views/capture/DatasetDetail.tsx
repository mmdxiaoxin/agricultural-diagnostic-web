import { getDatasetDetail } from "@/api/modules/file";
import DatasetTransfer from "@/components/DatasetTransfer";
import { Col, Form, Input, message, Row } from "antd";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import styles from "./DatasetDetail.module.scss";

export type DatasetDetailProps = {
	mode?: "create" | "edit";
};

const DatasetDetail: React.FC<DatasetDetailProps> = ({ mode }) => {
	const { id } = useParams();

	const [form] = Form.useForm();

	const fetchDataset = async (id: number) => {
		try {
			const response = await getDatasetDetail(id);

			if (response.code !== 200) throw new Error(response.message);

			form.setFieldsValue(response.data);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	useEffect(() => {
		if (mode === "edit" && id) {
			fetchDataset(Number(id));
		}
	}, [id, mode]);

	return (
		<Row gutter={16} className={styles["container"]}>
			<Col span={6}>
				<Form form={form} layout="vertical" initialValues={{ id, name: "", description: "" }}>
					<Form.Item label="数据集名称" name="name">
						<Input />
					</Form.Item>
					<Form.Item label="数据集描述" name="description">
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Col>
			<Col span={18}>
				<DatasetTransfer />
			</Col>
		</Row>
	);
};

export default DatasetDetail;
