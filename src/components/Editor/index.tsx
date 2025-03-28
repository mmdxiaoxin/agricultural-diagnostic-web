import Editor from "@monaco-editor/react";
import React from "react";

interface MonacoEditorProps {
	value: string;
	onChange?: (value: string) => void;
	language?: string;
	theme?: "light" | "vs-dark";
	options?: {
		readOnly?: boolean;
		minimap?: { enabled: boolean };
		fontSize?: number;
		wordWrap?: "on" | "off";
		scrollBeyondLastLine?: boolean;
	};
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
	value,
	onChange,
	language = "javascript",
	theme = "light",
	options = {
		minimap: { enabled: true },
		fontSize: 14,
		wordWrap: "on",
		scrollBeyondLastLine: false
	}
}) => {
	return (
		<Editor
			height="500px"
			defaultLanguage={language}
			defaultValue={value}
			theme={theme}
			onChange={newValue => onChange?.(newValue || "")}
			options={options}
		/>
	);
};

export default MonacoEditor;
