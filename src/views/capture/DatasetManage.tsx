import DatasetsList from "@/components/DatasetsList";
import React from "react";
import styles from "./DatasetManage.module.scss";

export type DatasetManageProps = {};

const DatasetManage: React.FC<DatasetManageProps> = () => {
	return (
		<div className={styles["container"]}>
			<div className={styles["header"]}>Header</div>
			<DatasetsList className={styles["content"]} />
		</div>
	);
};

export default DatasetManage;
