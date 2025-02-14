import { DatasetMeta, ReqUpdateDataset } from "@/api/interface";
import { deleteDataset, getDatasetsList, updateDataset } from "@/api/modules/file";
import { formatSize } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, List, message, Modal, Popconfirm, Tag } from "antd";
import React, { useEffect, useState } from "react";

export type DatasetsListProps = {};

const DatasetsList: React.FC<DatasetsListProps> = () => {
	const [form] = Form.useForm();

	const [loading, setLoading] = useState<boolean>(false);
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
	const [currentDataset, setCurrentDataset] = useState<DatasetMeta | null>(null);

	const fetchListData = async () => {
		setLoading(true);
		try {
			const res = await getDatasetsList();
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setDatasets(res.data.list);
		} catch (error) {
			message.error("加载文件列表失败");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchListData();
	}, []);

	const handleDelete = async (datasetId: number) => {
		try {
			await deleteDataset(datasetId);
			await fetchListData();

			message.success("文件删除成功");
		} catch (error) {
			message.error("删除文件失败");
		}
	};

	const handleSave = async (values: ReqUpdateDataset) => {
		try {
			if (!currentDataset) return;

			await updateDataset(currentDataset.id, values);
			await fetchListData();

			setCurrentDataset(null);
			message.success("数据集更新成功");
		} catch (error) {
			message.error("数据集更新失败");
		}
	};

	return (
		<>
			<List
				loading={loading}
				itemLayout="vertical"
				dataSource={datasets}
				renderItem={dataset => (
					<List.Item
						key={dataset.id}
						actions={[
							<Button
								type="link"
								icon={<EditOutlined />}
								onClick={() => setCurrentDataset(dataset)}
							>
								编辑
							</Button>,
							<Popconfirm
								title="确认删除?"
								description="删除数据集后不可恢复"
								onConfirm={() => handleDelete(dataset.id)}
								okText="确认"
								cancelText="取消"
							>
								<Button type="link" danger icon={<DeleteOutlined />}>
									删除
								</Button>
							</Popconfirm>
						]}
					>
						<List.Item.Meta title={dataset.name} description={dataset.description} />
						<div>
							<Tag color={"green"}>文件总数: {dataset.file_count}</Tag>
							<span>{formatSize(dataset.dataset_size)}</span>
						</div>
					</List.Item>
				)}
			/>
			<Modal
				title="编辑数据集"
				open={!!currentDataset}
				onOk={() => form.submit()}
				onCancel={() => setCurrentDataset(null)}
			>
				<Form
					form={form}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 18 }}
					layout="horizontal"
					onFinish={handleSave}
				>
					<Form.Item label="数据集名称" name="name" initialValue={currentDataset?.name}>
						<Input />
					</Form.Item>
					<Form.Item
						label="数据集描述"
						name="description"
						initialValue={currentDataset?.description}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default DatasetsList;
