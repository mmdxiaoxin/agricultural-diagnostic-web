import { FileMeta } from "@/api/interface";
import { downloadFile } from "@/api/modules";
import { Button, Image, Spin, Tooltip } from "antd";
import React, { PropsWithChildren, useState } from "react";

export type FilePreviewProps = PropsWithChildren<{
	meta: FileMeta;
	text: string;
}>;

const FilePreview: React.FC<FilePreviewProps> = ({ meta, text, children }) => {
	const [fileUrl, setFileUrl] = useState<string>();

	// 异步加载文件
	const fetchData = async () => {
		try {
			const blob = await downloadFile(meta.id);
			const url = URL.createObjectURL(blob);
			setFileUrl(url);
		} catch (error) {
			console.error("Error fetching file:", error);
		}
	};

	// 获取文件预览，当前支持图片类型
	const PreviewImage: React.FC<FileMeta> = meta => {
		switch (meta.fileType) {
			case "image/png":
			case "image/jpeg":
			case "image/gif":
				return (
					<>
						{fileUrl ? (
							<Image
								src={fileUrl}
								alt="file preview"
								style={{ maxWidth: "100%", borderRadius: "8px" }}
							/>
						) : (
							<Spin />
						)}
					</>
				);
			default:
				return <p>无法预览该文件类型</p>;
		}
	};

	return (
		<>
			<Tooltip
				onOpenChange={async visible => {
					if (visible && !fileUrl) {
						await fetchData();
					}
				}}
				title={PreviewImage(meta)}
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
		</>
	);
};

export default FilePreview;
