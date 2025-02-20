import { DatasetMeta } from "@/api/interface";
import { deleteDataset, getDatasetsList } from "@/api/modules/file";
import { formatSize } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, List, message, Popconfirm, Tag } from "antd";
import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";

export interface DatasetsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const DatasetsList: React.FC<DatasetsListProps> = props => {
	const [loading, setLoading] = useState<boolean>(false);
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]);

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

	return (
		<div {...props}>
			<List
				loading={loading}
				itemLayout="vertical"
				dataSource={datasets}
				grid={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
				renderItem={dataset => (
					<Card key={dataset.id} className={styles["list-item"]} hoverable>
						<List.Item
							actions={[
								<Button type="link" icon={<EditOutlined />}>
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
							<List.Item.Meta
								title={dataset.name}
								description={
									<div className={styles["list-item__content"]}>
										<p>{dataset.description}</p>
										<Tag color={"green"}>文件总数: {dataset.file_count}</Tag>
										<span>{formatSize(dataset.dataset_size || 0)}</span>
									</div>
								}
							/>
						</List.Item>
					</Card>
				)}
			/>
		</div>
	);
};

export default DatasetsList;
