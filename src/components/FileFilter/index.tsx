import { MIME_TYPE } from "@/constants";
import { Button, Cascader, DatePicker, Flex, Form, Input, Space } from "antd";
import dayjs from "dayjs";
import React from "react";

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
		<Form form={form} onFinish={onSearch} layout="horizontal">
			<Form.Item label="文件名称" name="fileName">
				<Input placeholder="文件名" style={{ marginBottom: 16 }} />
			</Form.Item>
			<Form.Item label="文件类型" name="fileType">
				<Cascader
					options={fileTypeOptions}
					multiple
					placeholder="选择文件类型"
					style={{ width: "100%", marginBottom: 16 }}
				/>
			</Form.Item>
			<Form.Item label="创建时间" name="createdDateRange">
				<DatePicker.RangePicker
					style={{ width: "100%", marginBottom: 16 }}
					placeholder={["创建时间起", "创建时间止"]}
				/>
			</Form.Item>
			<Form.Item label="更新时间" name="updatedDateRange">
				<DatePicker.RangePicker
					style={{ width: "100%" }}
					placeholder={["更新时间起", "更新时间止"]}
				/>
			</Form.Item>
			<Form.Item>
				<Flex justify="space-between" gap={16}>
					<Button
						type="primary"
						onClick={() => {
							form.submit();
						}}
						style={{ width: "100%", marginTop: 16 }}
					>
						搜索
					</Button>
					<Button
						onClick={() => {
							form.resetFields();
							onReset?.();
						}}
						style={{ width: "100%", marginTop: 16 }}
					>
						重置
					</Button>
				</Flex>
			</Form.Item>
		</Form>
	);
};

export default FileFilter;
