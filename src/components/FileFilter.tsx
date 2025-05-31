import { MIME_TYPE } from "@/constants";
import { Button, Cascader, DatePicker, Flex, Form, Input } from "antd";
import dayjs from "dayjs";
import React from "react";
import clsx from "clsx";
import { SearchOutlined } from "@ant-design/icons";

export type FilterForm = {
	fileName?: string;
	fileType?: string[][];
	createdDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
	updatedDateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
};

export type FileFilterProps = {
	onSearch?: (values: FilterForm) => void;
	onReset?: () => void;
};

// 级联选项数据结构
const fileTypeOptions = Object.keys(MIME_TYPE).map(category => {
	const types = MIME_TYPE[category as keyof typeof MIME_TYPE];
	return {
		value: category,
		label: category,
		children: Object.keys(types).map(type => ({
			value: types[type as keyof typeof types],
			label: type
		}))
	};
});

const FileFilter: React.FC<FileFilterProps> = ({ onSearch, onReset }) => {
	const [form] = Form.useForm();

	return (
		<div
			className={clsx(
				"p-6",
				"rounded-2xl",
				"bg-white",
				"shadow-sm",
				"border border-gray-100",
				"transition-all duration-300",
				"hover:shadow-md"
			)}
		>
			<Form form={form} onFinish={onSearch} layout="vertical" className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Form.Item
						label={<span className="text-gray-700 font-medium">文件名称</span>}
						name="fileName"
					>
						<Input
							placeholder="输入文件名进行搜索"
							prefix={<SearchOutlined className="text-gray-400" />}
							className={clsx(
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-gray-700 font-medium">文件类型</span>}
						name="fileType"
					>
						<Cascader
							options={fileTypeOptions}
							multiple
							placeholder="选择文件类型"
							className={clsx(
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-gray-700 font-medium">创建时间</span>}
						name="createdDateRange"
					>
						<DatePicker.RangePicker
							className={clsx(
								"w-full",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
							placeholder={["创建时间起", "创建时间止"]}
						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-gray-700 font-medium">更新时间</span>}
						name="updatedDateRange"
					>
						<DatePicker.RangePicker
							className={clsx(
								"w-full",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
							placeholder={["更新时间起", "更新时间止"]}
						/>
					</Form.Item>
				</div>

				<Form.Item className="mb-0">
					<Flex justify="space-between" gap={4}>
						<Button
							type="primary"
							onClick={() => {
								form.submit();
							}}
							className={clsx(
								"flex-1",
								"h-10",
								"rounded-lg",
								"bg-blue-500 hover:bg-blue-600",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							搜索
						</Button>
						<Button
							onClick={() => {
								form.resetFields();
								onReset?.();
							}}
							className={clsx(
								"flex-1",
								"h-10",
								"rounded-lg",
								"bg-gray-100 hover:bg-gray-200",
								"border-none",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300"
							)}
						>
							重置
						</Button>
					</Flex>
				</Form.Item>
			</Form>
		</div>
	);
};

export default FileFilter;
