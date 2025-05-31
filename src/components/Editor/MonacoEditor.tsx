import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import React, { useCallback, useMemo } from "react";

// 编辑器主题类型
export type EditorTheme = "light" | "vs-dark" | "hc-black";

// 编辑器语言类型
export type EditorLanguage =
	| "javascript"
	| "typescript"
	| "json"
	| "html"
	| "css"
	| "sql"
	| "markdown"
	| "yaml"
	| "xml";

// 编辑器配置选项
export interface EditorOptions {
	// 基础配置
	readOnly?: boolean;
	minimap?: { enabled: boolean };
	fontSize?: number;
	wordWrap?: "on" | "off";
	scrollBeyondLastLine?: boolean;

	// 编辑器行为
	automaticLayout?: boolean;
	tabSize?: number;
	insertSpaces?: boolean;
	lineNumbers?: "on" | "off" | "relative" | "interval";
	renderWhitespace?: "none" | "boundary" | "selection" | "all";

	// 代码提示
	suggestOnTriggerCharacters?: boolean;
	quickSuggestions?: boolean | { other: boolean; comments: boolean; strings: boolean };

	// 代码折叠
	folding?: boolean;
	foldingStrategy?: "indentation" | "auto";

	// 滚动条
	scrollbar?: {
		vertical?: "visible" | "hidden" | "auto";
		horizontal?: "visible" | "hidden" | "auto";
		useShadows?: boolean;
		verticalScrollbarSize?: number;
		horizontalScrollbarSize?: number;
		arrowSize?: number;
	};
}

// 组件属性接口
export interface MonacoEditorProps {
	// 基础属性
	value: string;
	onChange?: (value: string) => void;
	language?: EditorLanguage;
	theme?: EditorTheme;
	options?: EditorOptions;

	// 高度配置
	height?: string | number;
	minHeight?: string | number;
	maxHeight?: string | number;

	// 编辑器事件
	onMount?: (editor: any) => void;
	onValidate?: (markers: any[]) => void;
	onSave?: (value: string) => void;

	// 错误处理
	onError?: (error: Error) => void;

	// 加载状态
	loading?: boolean;

	// 占位符
	placeholder?: string;

	// 自定义样式
	className?: string;
	style?: React.CSSProperties;
}

// 默认配置
const defaultOptions: EditorOptions = {
	minimap: { enabled: true },
	fontSize: 14,
	wordWrap: "on",
	scrollBeyondLastLine: false,
	automaticLayout: true,
	tabSize: 2,
	insertSpaces: true,
	lineNumbers: "on",
	suggestOnTriggerCharacters: true,
	quickSuggestions: true,
	folding: true,
	foldingStrategy: "indentation",
	scrollbar: {
		vertical: "auto",
		horizontal: "auto",
		useShadows: false,
		verticalScrollbarSize: 10,
		horizontalScrollbarSize: 10,
		arrowSize: 30
	}
};

const MonacoEditor: React.FC<MonacoEditorProps> = ({
	value,
	onChange,
	language = "javascript",
	theme = "vs-dark",
	options = {},
	height = "500px",
	minHeight,
	maxHeight,
	onMount,
	onValidate,
	onSave,
	onError,
	loading = false,
	placeholder,
	className,
	style
}) => {
	// 合并默认配置和用户配置
	const mergedOptions = useMemo(
		() => ({
			...defaultOptions,
			...options
		}),
		[options]
	);

	// 处理编辑器挂载
	const handleMount: OnMount = useCallback(
		editor => {
			try {
				// 设置占位符
				if (placeholder) {
					editor.updateOptions({
						placeholder: placeholder
					});
				}

				// 设置快捷键
				editor.addCommand(2048 | 49, () => {
					// Ctrl/Cmd + S
					onSave?.(value);
				});

				onMount?.(editor);
			} catch (error) {
				onError?.(error as Error);
			}
		},
		[placeholder, onMount, onSave, value, onError]
	);

	// 处理内容变化
	const handleChange: OnChange = useCallback(
		value => {
			try {
				onChange?.(value || "");
			} catch (error) {
				onError?.(error as Error);
			}
		},
		[onChange, onError]
	);

	// 处理验证
	const handleValidate = useCallback(
		(markers: any[]) => {
			try {
				onValidate?.(markers);
			} catch (error) {
				onError?.(error as Error);
			}
		},
		[onValidate, onError]
	);

	// 计算编辑器容器样式
	const containerStyle = useMemo(
		() => ({
			position: "relative" as const,
			width: "100%",
			height: height,
			minHeight: minHeight || "200px",
			maxHeight: maxHeight || "800px",
			...style
		}),
		[height, minHeight, maxHeight, style]
	);

	if (loading) {
		return (
			<div className={`monaco-editor-loading ${className || ""}`} style={containerStyle}>
				<div className="monaco-editor-loading-spinner" />
			</div>
		);
	}

	return (
		<div className={`monaco-editor-container ${className || ""}`} style={containerStyle}>
			<Editor
				height="100%"
				defaultLanguage={language}
				value={value}
				theme={theme}
				onChange={handleChange}
				onMount={handleMount}
				onValidate={handleValidate}
				options={{
					...mergedOptions,
					automaticLayout: true
				}}
			/>
		</div>
	);
};

MonacoEditor.displayName = "MonacoEditor";

export default MonacoEditor;
