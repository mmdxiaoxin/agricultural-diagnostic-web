import { Dropdown, MenuProps, Tag } from "antd";
import React from "react";

export type FileAccessProps = {
	access: string;
	onChange?: (access: string) => void;
};

const FileAccess: React.FC<FileAccessProps> = ({ access, onChange }) => {
	const onClick: MenuProps["onClick"] = ({ key }) => {
		if (key === "1") {
			onChange?.("public");
		} else if (key === "2") {
			onChange?.("private");
		}
	};

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: "public",
			disabled: access === "public"
		},
		{
			key: "2",
			label: "private",
			disabled: access === "private"
		}
	];

	return (
		<Dropdown menu={{ items, onClick }} trigger={["click"]} overlayStyle={{ width: "100px" }}>
			<Tag
				color={access === "public" ? "green" : "orange"}
				style={{
					maxWidth: "200px",
					display: "inline-block",
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					cursor: "pointer"
				}}
			>
				{access}
			</Tag>
		</Dropdown>
	);
};

export default FileAccess;
