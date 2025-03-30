import { RemoteConfig } from "@/api/interface";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { forwardRef, useImperativeHandle, useState } from "react";
import Draggable from "react-draggable";

interface ConfigListModalProps {
	configs: RemoteConfig[];
}

export interface ConfigListModalRef {
	open: () => void;
	close: () => void;
}

const ConfigListModal = forwardRef<ConfigListModalRef, ConfigListModalProps>(({ configs }, ref) => {
	const [visible, setVisible] = useState(false);

	useImperativeHandle(ref, () => ({
		open: () => setVisible(true),
		close: () => setVisible(false)
	}));

	const columns: ColumnsType<RemoteConfig> = [
		{
			title: "配置名称",
			dataIndex: "name",
			key: "name",
			width: 200,
			render: text => <span className="font-medium text-gray-800">{text}</span>
		},
		{
			title: "配置描述",
			dataIndex: "description",
			key: "description",
			width: 300,
			render: text => <span className="text-gray-600">{text || "-"}</span>
		},
		{
			title: "配置状态",
			dataIndex: "status",
			key: "status",
			width: 100,
			render: text => <Tag color={text === "active" ? "success" : "error"}>{text}</Tag>
		}
	];

	if (!visible) return null;

	return (
		<Draggable handle=".drag-handle" bounds="body">
			<div
				className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200"
				style={{ width: "600px", top: "100px", left: "50%" }}
			>
				<div className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 cursor-move">
					<h3 className="text-lg font-medium text-gray-800">配置列表</h3>
					<button
						onClick={() => setVisible(false)}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="p-4">
					<Table<RemoteConfig>
						columns={columns}
						dataSource={configs}
						rowKey="id"
						pagination={false}
						size="small"
					/>
				</div>
			</div>
		</Draggable>
	);
});

export default ConfigListModal;
