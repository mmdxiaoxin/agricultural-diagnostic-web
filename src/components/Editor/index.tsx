import Editor from "@monaco-editor/react";
import React from "react";

interface MonacoEditorProps {
	value: string;
	onChange?: (value: string) => void;
	language?: string;
	theme?: "light" | "vs-dark";
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
	value,
	onChange,
	language = "javascript",
	theme = "vs-dark"
}) => {
	return (
		<Editor
			height="500px"
			defaultLanguage={language}
			defaultValue={value}
			theme={theme}
			onChange={newValue => onChange?.(newValue || "")}
			options={{
				minimap: { enabled: true },
				fontSize: 14,
				wordWrap: "on",
				scrollBeyondLastLine: false
			}}
		/>
	);
};

export default MonacoEditor;
