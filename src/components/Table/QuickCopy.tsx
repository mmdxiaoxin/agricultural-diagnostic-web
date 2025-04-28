import { Typography, Tooltip } from "antd";
import clsx from "clsx";
import React from "react";

const { Paragraph } = Typography;

export type QuickCopyProps = {
	text: string;
	maxLength?: number;
};

const QuickCopy: React.FC<QuickCopyProps> = ({ text, maxLength = 30 }) => {
	const displayText =
		maxLength && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

	const content = (
		<Paragraph
			copyable
			ellipsis={{ rows: 1, expandable: true }}
			className={clsx("text-blue-500 cursor-pointer hover:text-blue-600", "!mb-0")}
		>
			{displayText}
		</Paragraph>
	);

	return text.length > maxLength ? <Tooltip title={text}>{content}</Tooltip> : content;
};

export default QuickCopy;
