import clsx from "clsx";
import { ReactNode } from "react";
import Draggable from "react-draggable";

export type ResponsiveWidth = {
	xs?: number | string;
	sm?: number | string;
	md?: number | string;
	lg?: number | string;
	xl?: number | string;
	xxl?: number | string;
};

export interface DraggableModalProps {
	/** 是否可见 */
	visible: boolean;
	/** 标题 */
	title: ReactNode;
	/** 内容 */
	children: ReactNode;
	/** 宽度 */
	width?: number | string | ResponsiveWidth;
	/** 关闭回调 */
	onClose: () => void;
	/** 自定义样式 */
	className?: string;
	/** 自定义内容区域样式 */
	bodyStyle?: React.CSSProperties;
	/** 是否显示关闭按钮 */
	closable?: boolean;
	/** 是否可拖拽 */
	draggable?: boolean;
	/** 初始位置 */
	defaultPosition?: { x: number; y: number };
}

const defaultWidth = {
	xs: "100%",
	sm: "520px",
	md: "600px",
	lg: "800px",
	xl: "1000px",
	xxl: "1200px"
};

const getResponsiveWidth = (width: DraggableModalProps["width"]): string => {
	if (typeof width === "number") {
		return `${width}px`;
	}
	if (typeof width === "string") {
		return width;
	}
	if (typeof width === "object") {
		const breakpoints = {
			xs: "(max-width: 575px)",
			sm: "(min-width: 576px)",
			md: "(min-width: 768px)",
			lg: "(min-width: 992px)",
			xl: "(min-width: 1200px)",
			xxl: "(min-width: 1600px)"
		};

		const mediaQueries = Object.entries(width)
			.map(([key, value]) => {
				const breakpoint = breakpoints[key as keyof typeof breakpoints];
				if (!breakpoint) return "";
				return `@media ${breakpoint} { width: ${typeof value === "number" ? `${value}px` : value}; }`;
			})
			.join(" ");

		return mediaQueries;
	}
	return defaultWidth.md;
};

const DraggableModal = ({
	visible,
	title,
	children,
	width = defaultWidth.md,
	onClose,
	className = "",
	bodyStyle,
	closable = true,
	draggable = true,
	defaultPosition = { x: 0, y: -100 }
}: DraggableModalProps) => {
	if (!visible) return null;

	const modalContent = (
		<div
			className={clsx("fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200", className)}
			style={{
				...bodyStyle,
				...(typeof width === "object" ? {} : { width: getResponsiveWidth(width) })
			}}
		>
			<style>{typeof width === "object" && getResponsiveWidth(width)}</style>
			<div
				className={clsx(
					"drag-handle",
					"flex items-center justify-between p-4 border-b border-gray-200",
					"cursor-move hover:bg-gray-50 transition-colors duration-200",
					"select-none"
				)}
			>
				<h3 className="text-lg font-medium text-gray-800">{title}</h3>
				{closable && (
					<button
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							onClose();
						}}
						onTouchStart={e => {
							e.preventDefault();
							e.stopPropagation();
							onClose();
						}}
						className={clsx(
							"text-gray-400 hover:text-gray-600",
							"transition-colors touch-manipulation cursor-pointer",
							"flex items-center justify-center",
							"w-5 h-5"
						)}
						style={{ touchAction: "manipulation" }}
					>
						<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				)}
			</div>
			<div className="p-4">{children}</div>
		</div>
	);

	if (!draggable) {
		return modalContent;
	}

	return (
		<Draggable handle=".drag-handle" bounds="body" defaultPosition={defaultPosition}>
			{modalContent}
		</Draggable>
	);
};

export default DraggableModal;
