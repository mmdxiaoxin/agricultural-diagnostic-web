import { getFileTypeColor } from "@/utils";
import { Tag, Tooltip } from "antd";
import React from "react";

export type FileTypeTagProps = {
	type: string;
};

const FileTypeTag: React.FC<FileTypeTagProps> = ({ type }) => (
	<Tooltip title={type}>
		<Tag
			color={getFileTypeColor(type)}
			style={{
				maxWidth: "200px",
				display: "inline-block",
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis"
			}}
		>
			{type}
		</Tag>
	</Tooltip>
);

export default React.memo(FileTypeTag);
