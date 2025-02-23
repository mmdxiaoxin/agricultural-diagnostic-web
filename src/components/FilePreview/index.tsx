import { Button, Image, Tooltip } from "antd";
import React, { PropsWithChildren } from "react";

interface FileMeta {
	file_type: string;
	file_url?: string;
}

interface FilePreviewProps
	extends PropsWithChildren<{
		meta: FileMeta;
		text: string;
	}> {}

const getPreviewImage = (meta: FileMeta) => {
	switch (meta.file_type) {
		case "image/png":
		case "image/jpeg":
		case "image/jpg":
		case "image/gif":
			return <Image src={meta.file_url} />;
		default:
			return null;
	}
};

const FilePreview: React.FC<FilePreviewProps> = ({ meta, text, children }) => {
	return (
		<Tooltip
			title={
				<div>
					{getPreviewImage(meta)}
					{text}
				</div>
			}
		>
			{children ? (
				children
			) : (
				<Button
					type="link"
					style={{
						padding: 0,
						margin: 0,
						height: "auto",
						maxWidth: "250px",
						display: "inline-block",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis"
					}}
				>
					{text}
				</Button>
			)}
		</Tooltip>
	);
};

export default FilePreview;
