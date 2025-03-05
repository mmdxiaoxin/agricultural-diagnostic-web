import { FileMeta } from "@/api/interface";
import { getAllFiles } from "@/api/modules/file";
import type { GetProp, TableColumnsType, TableProps, TransferProps } from "antd";
import { Flex, Table, Transfer } from "antd";
import React, { useEffect, useState } from "react";
import FilePreview from "../Table/FilePreview";
import FileTypeTag from "../Table/FileTypeTag";

type TransferItem = GetProp<TransferProps, "dataSource">[number];
type TableRowSelection<T extends object> = TableProps<T>["rowSelection"];

interface TableTransferProps extends TransferProps<TransferItem> {
	dataSource: FileMeta[];
	leftColumns: TableColumnsType<FileMeta>;
	rightColumns: TableColumnsType<FileMeta>;
}

const TableTransfer: React.FC<TableTransferProps> = props => {
	const { leftColumns, rightColumns, ...restProps } = props;
	return (
		<Transfer rowKey={item => item.id} style={{ width: "100%" }} {...restProps}>
			{({
				direction,
				filteredItems,
				onItemSelect,
				onItemSelectAll,
				selectedKeys: listSelectedKeys,
				disabled: listDisabled
			}) => {
				const columns = direction === "left" ? leftColumns : rightColumns;
				const rowSelection: TableRowSelection<TransferItem> = {
					getCheckboxProps: () => ({ disabled: listDisabled }),
					onChange(selectedRowKeys) {
						onItemSelectAll(selectedRowKeys, "replace");
					},
					selectedRowKeys: listSelectedKeys,
					selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
				};

				return (
					<Table
						rowSelection={rowSelection}
						columns={columns}
						dataSource={filteredItems}
						pagination={{ pageSize: 9 }}
						size="small"
						style={{ pointerEvents: listDisabled ? "none" : undefined }}
						onRow={({ key, disabled: itemDisabled }) => ({
							onClick: () => {
								if (itemDisabled || listDisabled) {
									return;
								}
								onItemSelect(key, !listSelectedKeys.includes(key));
							}
						})}
					/>
				);
			}}
		</Transfer>
	);
};

const columns: TableColumnsType<FileMeta> = [
	{
		dataIndex: "originalFileName",
		title: "文件名",
		render: (value, record) => <FilePreview meta={record} text={value} />
	},
	{
		dataIndex: "fileType",
		title: "文件类型",
		render: (type: string) => <FileTypeTag type={type} />
	}
];

const filterOption = (input: string, item: FileMeta) => item.originalFileName?.includes(input);

export interface DatasetTransferProps {
	value?: TransferProps["targetKeys"];
	onChange?: TableTransferProps["onChange"];
}

const DatasetTransfer: React.FC<DatasetTransferProps> = ({ value, onChange }) => {
	const [fileList, setFileList] = useState<FileMeta[]>([]);

	const fetchFileList = async () => {
		try {
			const response = await getAllFiles();
			if (response.code !== 200 || !response.data) throw new Error("Failed to fetch file list");
			setFileList(response.data);
		} catch (error: any) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchFileList();
	}, []);

	return (
		<Flex align="start" gap="middle" vertical>
			<TableTransfer
				dataSource={fileList}
				targetKeys={value}
				showSearch
				showSelectAll={false}
				onChange={onChange}
				filterOption={filterOption}
				leftColumns={columns}
				rightColumns={columns}
			/>
		</Flex>
	);
};

export default DatasetTransfer;
