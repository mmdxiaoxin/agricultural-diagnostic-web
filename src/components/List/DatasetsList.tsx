import { DatasetMeta } from "@/api/interface";
import DatasetCard from "@/components/Card/DatasetCard";
import React from "react";

export interface DatasetsListProps {
	datasets?: DatasetMeta[];
	onEdit?: (datasetId: number) => void;
	onDelete?: (datasetId: number) => void;
	onDownload?: (datasetId: number) => void;
	onCopy?: (datasetId: number) => void;
	onAccessChange?: (datasetId: number, access: "public" | "private") => void;
	isPublic?: boolean;
}

const DatasetsList: React.FC<DatasetsListProps> = ({
	datasets,
	onEdit,
	onDelete,
	onDownload,
	onCopy,
	onAccessChange,
	isPublic = false
}) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:p-4">
			{datasets?.map((dataset, index) => (
				<DatasetCard
					key={dataset.id}
					dataset={dataset}
					onEdit={onEdit}
					onDelete={onDelete}
					onDownload={onDownload}
					onCopy={onCopy}
					onAccessChange={onAccessChange}
					isPublic={isPublic}
					index={index}
				/>
			))}
		</div>
	);
};

export default DatasetsList;
