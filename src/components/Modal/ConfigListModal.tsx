import { RemoteConfig } from "@/api/interface";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { forwardRef, useImperativeHandle, useState } from "react";
import DraggableModal from "./DraggableModal";

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

	return (
		<DraggableModal
			visible={visible}
			title="配置列表"
			onClose={() => setVisible(false)}
			width={600}
		>
			<Table<RemoteConfig>
				columns={columns}
				dataSource={configs}
				rowKey="id"
				pagination={{ pageSize: 5 }}
				size="small"
			/>
		</DraggableModal>
	);
});

export default ConfigListModal;
