import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm, Space, Tag, Typography } from "antd";
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
		type?: "primary" | "default" | "dashed" | "link" | "text";
		danger?: boolean;
		disabled?: boolean;
		className?: string;
	};
	selectMode?: {
		enabled: boolean;
		selectedCount: number;
		onToggle: () => void;
		onBatchDelete?: () => void;
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
	selectMode,
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
					{selectMode && (
						<>
							<Button
								type={selectMode.enabled ? "primary" : "default"}
								onClick={selectMode.onToggle}
								className={clsx(
									"px-6 h-10",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center gap-2",
									selectMode.enabled && "bg-blue-500 hover:bg-blue-600 border-none"
								)}
							>
								{selectMode.enabled ? "退出选择" : "批量选择"}
							</Button>
							{selectMode.enabled && selectMode.onBatchDelete && (
								<Popconfirm
									title="确定要删除选中的记录吗？"
									description={`已选择 ${selectMode.selectedCount} 条记录，删除后将无法恢复`}
									onConfirm={selectMode.onBatchDelete}
									okText="确定"
									cancelText="取消"
								>
									<Button
										danger
										disabled={selectMode.selectedCount === 0}
										className={clsx(
											"px-6 h-10",
											"rounded-lg",
											"shadow-sm hover:shadow-md",
											"transition-all duration-300",
											"flex items-center gap-2"
										)}
									>
										批量删除
									</Button>
								</Popconfirm>
							)}
						</>
					)}
					{actionButton && (
						<Button
							type={actionButton.type || "primary"}
							danger={actionButton.danger}
							disabled={actionButton.disabled}
							icon={actionButton.icon}
							onClick={actionButton.onClick}
							className={clsx(
								"px-6 h-10",
								"rounded-lg",
								"shadow-sm hover:shadow-md",
								"transition-all duration-300",
								"flex items-center gap-2",
								actionButton.className
							)}
						>
							{actionButton.text}
						</Button>
					)}
				</Space>
			</div>
			{selectMode?.enabled && (
				<div className="flex items-center gap-2">
					<Tag color="blue" className="px-3 py-1 rounded-full">
						已选择 {selectMode.selectedCount} 条记录
					</Tag>
				</div>
			)}
		</div>
	);
};

export default PageHeader;
