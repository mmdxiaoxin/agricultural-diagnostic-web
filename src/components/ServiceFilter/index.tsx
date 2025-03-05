import { FilterOutlined } from "@ant-design/icons";
import { Button, Form, Input, Popover, Select } from "antd";
import React from "react";

interface FormValues {
	serviceName?: string;
	serviceType?: string;
	status?: string;
}
export type ServiceFilterProps = {
	onFilter?: (values: FormValues) => void;
};

const ServiceFilter: React.FC<ServiceFilterProps> = ({ onFilter }) => {
	const handleFinish = (values: FormValues) => {
		onFilter?.(values);
	};

	const content = (
		<Form layout="horizontal" onFinish={handleFinish}>
			<Form.Item label="服务名称" name="serviceName">
				<Input placeholder="请输入服务名称" />
			</Form.Item>
			<Form.Item label="服务URL" name="endpointUrl">
				<Input placeholder="请输入服务URL" />
			</Form.Item>
			<Form.Item label="服务状态" name="status">
				<Select>
					<Select.Option value="active">开启</Select.Option>
					<Select.Option value="inactive">关闭</Select.Option>
					<Select.Option value="under_maintenance">维护中</Select.Option>
				</Select>
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					筛选
				</Button>
			</Form.Item>
		</Form>
	);

	return (
		<Popover content={content} title="服务筛选" trigger="click" placement="bottom">
			<Button type="text" icon={<FilterOutlined />} />
		</Popover>
	);
};

export default ServiceFilter;
