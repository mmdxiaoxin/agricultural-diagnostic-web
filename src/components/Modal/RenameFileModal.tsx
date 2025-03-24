import { Input, Modal } from "antd";
import clsx from "clsx";
import React, { forwardRef, useImperativeHandle, useState } from "react";

export interface RenameFileModalRef {
	open: (fileName: string) => void;
	close: () => void;
}

interface RenameFileModalProps {
	onOk: (newFileName: string) => void;
}

const RenameFileModal = forwardRef<RenameFileModalRef, RenameFileModalProps>(({ onOk }, ref) => {
	const [open, setOpen] = useState(false);
	const [newFileName, setNewFileName] = useState("");

	useImperativeHandle(ref, () => ({
		open: (fileName: string) => {
			setNewFileName(fileName);
			setOpen(true);
		},
		close: () => {
			setOpen(false);
			setNewFileName("");
		}
	}));

	const handleOk = () => {
		onOk(newFileName);
		setOpen(false);
		setNewFileName("");
	};

	const handleCancel = () => {
		setOpen(false);
		setNewFileName("");
	};

	return (
		<Modal
			title="重命名文件"
			open={open}
			onOk={handleOk}
			onCancel={handleCancel}
			className="rounded-lg"
		>
			<Input
				value={newFileName}
				onChange={e => setNewFileName(e.target.value)}
				placeholder="输入新的文件名"
				className={clsx(
					"rounded-lg",
					"border-gray-200",
					"focus:border-blue-500",
					"focus:ring-1 focus:ring-blue-500",
					"transition-all duration-300"
				)}
			/>
		</Modal>
	);
});

export default RenameFileModal;
