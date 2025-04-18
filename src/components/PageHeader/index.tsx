import { Button, Input, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string | ReactNode;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	actionButton?: {
		text: string;
		icon?: ReactNode;
		onClick: () => void;
	};
	className?: string;
}

const PageHeader = ({
	title,
	description,
	searchPlaceholder = "搜索...",
	searchValue,
	onSearchChange,
	actionButton,
	className
}: PageHeaderProps) => {
	return (
		<div
			className={clsx(
				"flex flex-col gap-6",
				"mb-6 p-6",
				"rounded-2xl",
				"bg-white",
				"shadow-sm",
				"border border-gray-100",
				"transition-all duration-300",
				"hover:shadow-md",
				className
			)}
		>
			<div className="flex justify-between items-center">
				<div className="flex flex-col">
					<Typography.Title level={2} className="text-gray-800 mb-2">
						{title}
					</Typography.Title>
					{description && <Typography.Text type="secondary">{description}</Typography.Text>}
				</div>
				<Space>
					{onSearchChange && (
						<Input
							placeholder={searchPlaceholder}
							prefix={<SearchOutlined className="text-gray-400" />}
							value={searchValue}
							onChange={e => onSearchChange(e.target.value)}
							className={clsx(
								"w-64",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300"
							)}
						/>
					)}
					{actionButton && (
						<Button
							type="primary"
							icon={actionButton.icon}
							onClick={actionButton.onClick}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2"
							)}
						>
							{actionButton.text}
						</Button>
					)}
				</Space>
			</div>
		</div>
	);
};

export default PageHeader;
