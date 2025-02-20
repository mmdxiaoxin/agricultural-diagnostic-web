import { DatasetMeta } from "@/api/interface";
import { deleteDataset, getDatasetsList } from "@/api/modules/file";
import DatasetsList from "@/components/DatasetsList";
import { Button, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./DatasetManage.module.scss";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [datasets, setDatasets] = useState<DatasetMeta[]>([]);

	const navigate = useNavigate();

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

	const handleAdd = () => {
		navigate("/capture/dataset/create");
	};

	const handleEdit = (datasetId: number) => {
		navigate(`/capture/dataset/edit/${datasetId}`);
	};

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
		<div className={styles["container"]}>
			<div className={styles["header"]}>
				<Button onClick={handleAdd}>新增</Button>
			</div>
			<div className={styles["content"]}>
				<DatasetsList
					loading={loading}
					datasets={datasets}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
};

export default DatasetManage;
