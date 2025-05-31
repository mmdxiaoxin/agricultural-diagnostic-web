import { FileMeta } from "@/api/interface";
import { getAllFiles } from "@/api/modules/file";
import type { GetProp, TableColumnsType, TableProps, TransferProps } from "antd";
import { Flex, Table, Transfer, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import FilePreview from "./Table/FilePreview";
import FileTypeTag from "./Table/FileTypeTag";
import clsx from "clsx";

const { Text } = Typography;

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
		<Transfer
			rowKey={item => item.id}
			style={{ width: "100%" }}
			className={clsx(
				"dataset-transfer",
				"flex flex-col",
				"gap-4",
				"p-2 lg:p-4",
				"bg-white",
				"rounded-xl",
				"shadow-sm",
				"hover:shadow-md",
				"transition-all duration-300"
			)}
			{...restProps}
		>
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
					<div
						className={clsx(
							"w-full",
							"flex flex-col",
							"gap-2",
							"p-2 lg:p-4",
							"bg-gray-50",
							"rounded-lg",
							"border border-gray-100"
						)}
					>
						<Text className="text-gray-600 font-medium mb-2">
							{direction === "left" ? "可选文件" : "已选文件"}
						</Text>
						<Table
							rowSelection={rowSelection}
							columns={columns}
							dataSource={filteredItems}
							pagination={{
								pageSize: 9,
								showSizeChanger: false,
								className: "mt-4",
								responsive: true,
								size: "small"
							}}
							size="small"
							className={clsx(
								"rounded-lg",
								"bg-white",
								"shadow-sm",
								"hover:shadow-md",
								"transition-all duration-300"
							)}
							style={{
								pointerEvents: listDisabled ? "none" : undefined,
								width: "100%"
							}}
							scroll={{ x: "max-content" }}
							onRow={({ key, disabled: itemDisabled }) => ({
								onClick: () => {
									if (itemDisabled || listDisabled) {
										return;
									}
									onItemSelect(key, !listSelectedKeys.includes(key));
								}
							})}
						/>
					</div>
				);
			}}
		</Transfer>
	);
};

const columns: TableColumnsType<FileMeta> = [
	{
		dataIndex: "originalFileName",
		title: "文件名",
		render: (value, record) => <FilePreview meta={record} text={value} />,
		width: "60%",
		ellipsis: true
	},
	{
		dataIndex: "fileType",
		title: "文件类型",
		render: (type: string) => <FileTypeTag type={type} />,
		width: "40%",
		align: "center"
	}
];

const filterOption = (input: string, item: FileMeta) => item.originalFileName?.includes(input);

export interface DatasetTransferProps {
	value?: TransferProps["targetKeys"];
	onChange?: TableTransferProps["onChange"];
}

const DatasetTransfer: React.FC<DatasetTransferProps> = ({ value, onChange }) => {
	const [fileList, setFileList] = useState<FileMeta[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchFileList = async () => {
		setLoading(true);
		try {
			const response = await getAllFiles();
			if (response.code !== 200 || !response.data) throw new Error("Failed to fetch file list");
			setFileList(response.data);
		} catch (error: any) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFileList();
	}, []);

	return (
		<Flex align="start" gap="middle" vertical className="w-full">
			{loading ? (
				<div className="w-full h-64 flex items-center justify-center">
					<Spin size="large" className="text-blue-500" />
				</div>
			) : (
				<TableTransfer
					dataSource={fileList}
					targetKeys={value}
					showSearch
					showSelectAll={false}
					onChange={onChange}
					filterOption={filterOption}
					leftColumns={columns}
					rightColumns={columns}
					className="dataset-transfer"
					operations={["选择", "取消"]}
					listStyle={{
						width: "100%",
						height: "100%"
					}}
				/>
			)}
		</Flex>
	);
};

export default DatasetTransfer;
