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
				"flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6",
				"mb-4 sm:mb-5 md:mb-6",
				"p-3 sm:p-4 md:p-5 lg:p-6",
				"rounded-xl sm:rounded-2xl",
				"bg-white",
				"shadow-sm hover:shadow-md",
				"border border-gray-100",
				"transition-all duration-300",
				className
			)}
		>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 md:gap-4">
				<div className="flex flex-col gap-0.5 sm:gap-1">
					<Typography.Title
						level={2}
						className={clsx(
							"text-base sm:text-lg md:text-xl",
							"font-semibold text-gray-800",
							"mb-0 sm:mb-0.5 md:mb-1"
						)}
					>
						{title}
					</Typography.Title>
					{description && (
						<Typography.Text
							type="secondary"
							className="text-xs sm:text-xs md:text-sm text-gray-500"
						>
							{description}
						</Typography.Text>
					)}
				</div>
				<Space direction="vertical" size="small" className="w-full sm:w-auto" split={null}>
					{onSearchChange && (
						<Input
							placeholder={searchPlaceholder}
							prefix={<SearchOutlined className="text-gray-400" />}
							value={searchValue}
							onChange={e => onSearchChange(e.target.value)}
							className={clsx(
								"w-full sm:w-48 md:w-56 lg:w-64",
								"h-7 sm:h-8 md:h-9",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300",
								"text-xs sm:text-sm"
							)}
						/>
					)}
					<Space className="w-full sm:w-auto justify-end sm:justify-start" size="small">
						{selectMode && (
							<>
								<Button
									type={selectMode.enabled ? "primary" : "default"}
									onClick={selectMode.onToggle}
									className={clsx(
										"w-full sm:w-auto",
										"h-7 sm:h-8 md:h-9",
										"px-3 sm:px-4 md:px-6",
										"rounded-lg",
										"shadow-sm hover:shadow-md",
										"transition-all duration-300",
										"flex items-center gap-1 sm:gap-2",
										"text-xs sm:text-sm",
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
												"w-full sm:w-auto",
												"h-7 sm:h-8 md:h-9",
												"px-3 sm:px-4 md:px-6",
												"rounded-lg",
												"shadow-sm hover:shadow-md",
												"transition-all duration-300",
												"flex items-center gap-1 sm:gap-2",
												"text-xs sm:text-sm"
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
									"w-full sm:w-auto",
									"h-7 sm:h-8 md:h-9",
									"px-3 sm:px-4 md:px-6",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center gap-1 sm:gap-2",
									"text-xs sm:text-sm",
									actionButton.className
								)}
							>
								{actionButton.text}
							</Button>
						)}
					</Space>
				</Space>
			</div>
			{selectMode?.enabled && (
				<div className="flex items-center gap-2">
					<Tag
						color="blue"
						className={clsx("px-2 sm:px-3 py-0.5 sm:py-1", "rounded-full", "text-xs")}
					>
						已选择 {selectMode.selectedCount} 条记录
					</Tag>
				</div>
			)}
		</div>
	);
};

export default PageHeader;
