import { Typography } from "antd";
import clsx from "clsx";
import React from "react";

const { Paragraph } = Typography;

export type QuickCopyProps = {
	text: string;
};

const QuickCopy: React.FC<QuickCopyProps> = ({ text }) => {
	return (
		<Paragraph
			copyable
			ellipsis={{ rows: 1, expandable: true }}
			className={clsx("text-blue-500 cursor-pointer hover:text-blue-600", "!mb-0")}
		>
			{text}
		</Paragraph>
	);
};

export default QuickCopy;
