import { Tooltip } from "antd";
import React from "react";

interface TextCellProps {
	text: string;
	maxLength?: number;
}

const TextCell: React.FC<TextCellProps> = ({ text, maxLength = 20 }) => {
	const isOverflow = text?.length > maxLength;
	const displayText = isOverflow ? `${text.slice(0, maxLength)}...` : text;

	return isOverflow ? (
		<Tooltip title={text}>
			<span>{displayText}</span>
		</Tooltip>
	) : (
		<span>{displayText}</span>
	);
};

export default TextCell;
