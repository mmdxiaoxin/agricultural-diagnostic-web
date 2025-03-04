import { Button, message, Tooltip } from "antd";
import React from "react";

export type QuickCopyProps = {
	text: string;
};

const QuickCopy: React.FC<QuickCopyProps> = ({ text }) => {
	const copyToClipboard = () => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				message.success("URL已复制到剪贴板");
			})
			.catch(() => {
				message.error("复制失败");
			});
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
