import { message, Tooltip, Typography } from "antd";
import clsx from "clsx";
import copy from "copy-to-clipboard";
import React from "react";

const { Paragraph } = Typography;

export type QuickCopyProps = {
	text: string;
};

const QuickCopy: React.FC<QuickCopyProps> = ({ text }) => {
	const copyToClipboard = () => {
		try {
			const success = copy(text);
			if (success) {
				message.success("URL已复制到剪贴板");
			} else {
				message.error("复制失败");
			}
		} catch (err) {
			message.error("复制失败");
		}
	};

	return (
		<Tooltip title="点击复制">
			<Paragraph
				onClick={copyToClipboard}
				ellipsis={{ rows: 1, expandable: true }}
				className={clsx("text-blue-500 cursor-pointer hover:text-blue-600", "!mb-0")}
			>
				{text}
			</Paragraph>
		</Tooltip>
	);
};

export default QuickCopy;
