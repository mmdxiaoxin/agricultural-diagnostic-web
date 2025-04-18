import { Tooltip, Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import React from "react";

const { Text } = Typography;

interface TextCellProps extends Omit<TextProps, "children"> {
	text: string;
	maxLength?: number;
}

const TextCell: React.FC<TextCellProps> = ({ text, maxLength = 20, ...props }) => {
	const isOverflow = text?.length > maxLength;
	const displayText = isOverflow ? `${text.slice(0, maxLength)}...` : text;

	return isOverflow ? (
		<Tooltip title={text}>
			<Text {...props}>{displayText}</Text>
		</Tooltip>
	) : (
		<Text {...props}>{displayText}</Text>
	);
};

export default TextCell;
