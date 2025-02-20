import { DatasetMeta } from "@/api/interface";
import { formatSize } from "@/utils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, List, ListProps, Popconfirm, Tag } from "antd";
import React from "react";
import styles from "./index.module.scss";

export interface DatasetsListProps extends ListProps<DatasetMeta> {
	datasets?: DatasetMeta[];
	onEdit?: (datasetId: number) => void;
	onDelete?: (datasetId: number) => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ loading, datasets, onEdit, onDelete }) => {
	return (
		<List
			loading={loading}
			itemLayout="vertical"
			dataSource={datasets}
			grid={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
			renderItem={dataset => (
				<Card key={dataset.id} className={styles["list-item"]} hoverable>
					<List.Item
						actions={[
							<Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.(dataset.id)}>
								编辑
							</Button>,
							<Popconfirm
								title="确认删除?"
								description="删除数据集后不可恢复"
								onConfirm={() => onDelete?.(dataset.id)}
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
	);
};

export default DatasetsList;
