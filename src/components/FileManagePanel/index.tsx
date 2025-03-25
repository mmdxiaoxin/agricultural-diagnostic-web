import { FileMeta } from "@/api/interface";
import { DownloadProgress } from "@/api/modules/file";
import FileFilter from "@/components/FileFilter";
import FileUpload from "@/components/FileUpload";
import DownloadList from "@/components/List/DownloadList";
import { SearchOutlined, SettingOutlined } from "@ant-design/icons";
import { Badge, Collapse, Input, Tabs, TabsProps } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import React from "react";

interface FileManagePanelProps {
	fileList: FileMeta[];
	activeKey: string;
	onActiveKeyChange: (key: string) => void;
	filterParams: {
		fileType?: string[][];
		fileName?: string;
		createdDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
		updatedDateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	};
	onFilterParamsChange: (params: any) => void;
	onSearch: (params: any) => void;
	progress: DownloadProgress;
	downloadList: FileMeta[];
	compressMode: boolean;
	onCompressModeChange: (checked: boolean) => void;
	onDownloadListClear: () => void;
}

const FileManagePanel: React.FC<FileManagePanelProps> = ({
	fileList,
	activeKey,
	onActiveKeyChange,
	filterParams,
	onFilterParamsChange,
	onSearch,
	progress,
	downloadList,
	compressMode,
	onCompressModeChange,
	onDownloadListClear
}) => {
	const pendingFilesCount = Object.values(progress).filter(p => p < 100).length;

	const items: TabsProps["items"] = [
		{
			key: "1",
			label: "数据筛选",
			children: (
				<FileFilter
					onSearch={values => {
						onFilterParamsChange(values);
						onSearch({ ...values, page: 1, pageSize: 10 });
					}}
					onReset={() => {
						onFilterParamsChange({
							fileType: [],
							fileName: "",
							createdDateRange: null,
							updatedDateRange: null
						});
						onSearch({
							page: 1,
							pageSize: 10
						});
					}}
				/>
			)
		},
		{
			key: "2",
			label: "数据上传",
			children: <FileUpload onUpload={() => onSearch({ page: 1, pageSize: 10 })} />
		},
		{
			key: "3",
			label: (
				<Badge count={pendingFilesCount}>
					<span>下载列表</span>
				</Badge>
			),
			children: (
				<DownloadList
					progress={progress}
					downloadList={downloadList}
					compressMode={compressMode}
					onCheck={onCompressModeChange}
					onClear={onDownloadListClear}
				/>
			)
		}
	];

	return (
		<Collapse
			defaultActiveKey={[]}
			className={clsx(
				"mb-6",
				"rounded-2xl",
				"bg-white",
				"shadow-sm",
				"border border-gray-100",
				"transition-all duration-300",
				"hover:shadow-md"
			)}
		>
			<Collapse.Panel
				key="1"
				header={
					<div className="flex items-center gap-2">
						<SettingOutlined className="text-lg text-gray-500" />
						<span className="text-base font-medium">文件管理功能区</span>
					</div>
				}
				className="border-none"
			>
				<div className="flex flex-col gap-6">
					<div className="flex justify-between items-center">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">文件管理</h2>
							<p className="text-gray-500">共 {fileList.length} 个文件</p>
						</div>
						<div className="flex items-center gap-4">
							<Input
								placeholder="搜索文件..."
								prefix={<SearchOutlined className="text-gray-400" />}
								value={filterParams.fileName}
								onChange={e => onFilterParamsChange({ ...filterParams, fileName: e.target.value })}
								className={clsx(
									"w-64",
									"rounded-lg",
									"border-gray-200",
									"focus:border-blue-500",
									"focus:ring-1 focus:ring-blue-500",
									"transition-all duration-300"
								)}
							/>
						</div>
					</div>

					<Tabs
						activeKey={activeKey}
						onChange={onActiveKeyChange}
						items={items}
						className="mt-4"
						tabBarStyle={{
							marginBottom: 16,
							borderBottom: "1px solid #f0f0f0"
						}}
					/>
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default FileManagePanel;
