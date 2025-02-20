import React from "react";
import { useParams } from "react-router";

export type DatasetDetailProps = {
	mode: "create" | "edit";
};

const DatasetDetail: React.FC<DatasetDetailProps> = () => {
	const { id } = useParams();
	return <div>DatasetDetail {id}</div>;
};

export default DatasetDetail;
