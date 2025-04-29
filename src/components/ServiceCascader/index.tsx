import { RemoteService } from "@/api/interface";
import { Cascader, Typography } from "antd";
import clsx from "clsx";
import React from "react";

const { Text } = Typography;

export interface ServiceCascaderProps {
	serviceList: RemoteService[];
	value?: [number, number];
	onChange?: (value: [number, number] | undefined) => void;
	className?: string;
}

const ServiceCascader: React.FC<ServiceCascaderProps> = ({
	serviceList,
	value,
	onChange,
	className
}) => {
	// 构建级联选择器的选项
	const cascaderOptions = serviceList.map(service => ({
		value: service.id,
		label: service.serviceName,
		disabled: service.status !== "active",
		children: service.configs.map(config => ({
			value: config.id,
			label: config.name,
			disabled: config.status !== "active"
		}))
	}));

	// 处理级联选择器的变化
	const handleChange = (value: (number | string)[]) => {
		if (value.length === 2) {
			onChange?.([value[0] as number, value[1] as number]);
		} else {
			onChange?.(undefined);
		}
	};

	return (
		<Cascader
			options={cascaderOptions}
			allowClear={false}
			onChange={handleChange}
			placeholder="请选择诊断服务和配置"
			className={clsx("w-full", className)}
			value={value}
			maxTagCount={1}
			maxTagPlaceholder={omittedValues => `+ ${omittedValues.length} 项`}
			showSearch={{
				filter: (inputValue, path) =>
					path.some(
						option => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1
					)
			}}
			displayRender={labels => (
				<div className="flex items-center gap-1">
					{labels.map((label, index) => (
						<React.Fragment key={index}>
							<Text
								ellipsis={{ tooltip: label }}
								className={index === 0 ? "text-blue-500" : "text-gray-600"}
								style={{ maxWidth: 150 }}
							>
								{label}
							</Text>
							{index < labels.length - 1 && <span className="mx-1">/</span>}
						</React.Fragment>
					))}
				</div>
			)}
			dropdownRender={menu => <div className="max-h-[300px] overflow-y-auto">{menu}</div>}
			popupClassName={clsx(
				"[&_.ant-cascader-menu]:min-w-[120px]",
				"[&_.ant-cascader-menu]:max-w-[200px]",
				"[&_.ant-cascader-menu-item]:px-2",
				"[&_.ant-cascader-menu-item]:py-1",
				"[&_.ant-typography]:block",
				"[&_.ant-typography]:max-w-full",
				"[&_.ant-cascader-picker-label]:max-w-full"
			)}
		/>
	);
};

export default ServiceCascader;
