import { ReactNode } from "react";
import Draggable from "react-draggable";
import { ModalProps } from "antd";

export interface DraggableModalProps {
	/** 是否可见 */
	visible: boolean;
	/** 标题 */
	title: ReactNode;
	/** 内容 */
	children: ReactNode;
	/** 宽度 */
	width?: number | string;
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

const DraggableModal = ({
	visible,
	title,
	children,
	width = 600,
	onClose,
	className = "",
	bodyStyle,
	closable = true,
	draggable = true,
	defaultPosition = { x: 0, y: 100 }
}: DraggableModalProps) => {
	if (!visible) return null;

	const modalContent = (
		<div
			className={`fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
			style={{ width, ...bodyStyle }}
		>
			<div className="drag-handle flex items-center justify-between p-4 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-800 cursor-move select-none">{title}</h3>
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
						className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
						style={{ touchAction: "manipulation" }}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
