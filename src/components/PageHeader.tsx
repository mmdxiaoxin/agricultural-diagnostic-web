import { DownOutlined, UpOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Input, Popconfirm, Tag, Typography, Tooltip } from "antd";
import clsx from "clsx";
import { ReactNode, useState } from "react";

interface SearchConfig {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	onSearch: (value: string) => void;
	className?: string;
	style?: React.CSSProperties;
}

interface ActionButton {
	text: string;
	icon?: ReactNode;
	onClick: () => void;
	type?: "primary" | "default" | "dashed" | "link" | "text";
	danger?: boolean;
	disabled?: boolean;
	className?: string;
}

interface SelectMode {
	enabled: boolean;
	selectedCount: number;
	onToggle: () => void;
	onBatchDelete?: () => void;
}

interface Statistics {
	label: string;
	value: number | string;
	className?: string;
}

interface PageHeaderProps {
	// 基础信息
	title: string;
	description?: string | ReactNode;
	className?: string;
	collapsible?: boolean; // 是否可收缩
	defaultCollapsed?: boolean; // 默认是否收缩

	// 搜索配置
	search?: SearchConfig;

	// 操作按钮
	actionButton?: ActionButton;

	// 批量选择模式
	selectMode?: SelectMode;

	// 统计信息
	statistics?: Statistics;

	// 额外内容
	extra?: ReactNode;

	// 自定义内容
	children?: ReactNode;

	// 帮助按钮
	onHelpClick?: () => void;
	helpTooltip?: string; // 帮助按钮的提示文本
}

const PageHeader = ({
	title,
	description,
	className,
	search,
	actionButton,
	selectMode,
	statistics,
	extra,
	children,
	collapsible = true,
	defaultCollapsed = false,
	onHelpClick,
	helpTooltip = "点击查看帮助信息" // 默认提示文本
}: PageHeaderProps) => {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);

	return (
		<div
			className={clsx(
				"flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6",
				"mb-4 sm:mb-5 md:mb-6",
				"p-3 sm:p-4 md:p-5 lg:p-6",
				"rounded-xl sm:rounded-2xl",
				"bg-white",
				"md:shadow-sm hover:shadow-md",
				"md:border border-gray-100",
				"transition-all duration-300",
				className
			)}
		>
			{/* 标题行 */}
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
					{collapsible && (
						<Button
							type="text"
							icon={collapsed ? <DownOutlined /> : <UpOutlined />}
							onClick={() => setCollapsed(!collapsed)}
							className="p-0 h-auto text-gray-500 hover:text-gray-700 flex-shrink-0"
						/>
					)}
					{collapsed ? (
						<span className="text-sm sm:text-base font-medium text-gray-800 truncate">{title}</span>
					) : (
						<Typography.Title
							level={2}
							className={clsx(
								"text-sm sm:text-lg md:text-xl",
								"font-semibold text-gray-800",
								"mb-0 sm:mb-0.5 md:mb-1",
								"truncate"
							)}
						>
							{title}
						</Typography.Title>
					)}
				</div>
				{!collapsed && (
					<div className="flex-shrink-0 flex items-center gap-2">
						{onHelpClick && (
							<Tooltip title={helpTooltip}>
								<Button
									type="text"
									icon={<QuestionCircleOutlined className="text-lg" />}
									onClick={onHelpClick}
									className={clsx(
										"p-1.5",
										"text-blue-500 hover:text-blue-600",
										"hover:bg-blue-50",
										"rounded-full",
										"transition-all duration-300"
									)}
								/>
							</Tooltip>
						)}
						{actionButton && (
							<Button
								type={actionButton.type || "primary"}
								danger={actionButton.danger}
								disabled={actionButton.disabled}
								icon={actionButton.icon}
								onClick={actionButton.onClick}
								className={clsx(
									"h-8 sm:h-8 md:h-9",
									"px-2.5 sm:px-4 md:px-6",
									"rounded-lg",
									"shadow-sm hover:shadow-md",
									"transition-all duration-300",
									"flex items-center justify-center gap-1 sm:gap-2",
									"text-xs sm:text-sm",
									actionButton.className
								)}
							>
								{actionButton.text}
							</Button>
						)}
					</div>
				)}
			</div>

			{/* 操作区域 */}
			{!collapsed && (
				<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
					{search && (
						<Input.Search
							placeholder={search.placeholder || "搜索..."}
							value={search.value}
							onChange={e => search.onChange?.(e.target.value)}
							onSearch={search.onSearch}
							allowClear
							className={clsx(
								"w-full sm:w-48 md:w-56 lg:w-64",
								"h-8 sm:h-8 md:h-9",
								"rounded-lg",
								"border-gray-200",
								"focus:border-blue-500",
								"focus:ring-1 focus:ring-blue-500",
								"transition-all duration-300",
								"text-xs sm:text-sm",
								search.className
							)}
							style={search.style}
						/>
					)}
					<div className="flex flex-wrap gap-1.5 sm:gap-3">
						{selectMode && (
							<>
								<Button
									type={selectMode.enabled ? "primary" : "default"}
									onClick={selectMode.onToggle}
									className={clsx(
										"w-full sm:w-auto",
										"h-8 sm:h-8 md:h-9",
										"px-2.5 sm:px-4 md:px-6",
										"rounded-lg",
										"shadow-sm hover:shadow-md",
										"transition-all duration-300",
										"flex items-center justify-center gap-1 sm:gap-2",
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
												"h-8 sm:h-8 md:h-9",
												"px-2.5 sm:px-4 md:px-6",
												"rounded-lg",
												"shadow-sm hover:shadow-md",
												"transition-all duration-300",
												"flex items-center justify-center gap-1 sm:gap-2",
												"text-xs sm:text-sm"
											)}
										>
											批量删除
										</Button>
									</Popconfirm>
								)}
							</>
						)}
						{extra}
					</div>
				</div>
			)}

			{!collapsed && (
				<>
					{description && (
						<Typography.Text
							type="secondary"
							className="text-xs sm:text-xs md:text-sm text-gray-500"
						>
							{description}
						</Typography.Text>
					)}
					{statistics && (
						<Typography.Text
							type="secondary"
							className={clsx("text-xs sm:text-xs md:text-sm text-gray-500", statistics.className)}
						>
							{statistics.label} {statistics.value}
						</Typography.Text>
					)}
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
					{children}
				</>
			)}
		</div>
	);
};

export default PageHeader;
