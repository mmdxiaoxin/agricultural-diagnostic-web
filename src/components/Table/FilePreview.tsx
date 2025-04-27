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

	// 判断是否为可预览的图片类型
	const isPreviewableImage = (fileType: string) => {
		return ["image/png", "image/jpeg", "image/gif"].includes(fileType);
	};

	// 获取文件预览
	const PreviewImage: React.FC<FileMeta> = meta => {
		if (!isPreviewableImage(meta.fileType)) {
			return <p>无法预览该文件类型</p>;
		}

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
	};

	return (
		<>
			<Tooltip
				onOpenChange={async visible => {
					if (visible && !fileUrl && isPreviewableImage(meta.fileType)) {
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
