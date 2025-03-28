import { Button, message, Tooltip } from "antd";
import copy from "copy-to-clipboard";
import React from "react";

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
			<Button type="link" onClick={copyToClipboard}>
				{text}
			</Button>
		</Tooltip>
	);
};

export default QuickCopy;
