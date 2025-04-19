import { RemoteInterface } from "@/api/interface/service";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { forwardRef, useImperativeHandle, useState } from "react";
import DraggableModal from "./DraggableModal";

interface InterfaceListModalProps {
	interfaces: RemoteInterface[];
}

export interface InterfaceListModalRef {
	open: () => void;
	close: () => void;
}

const InterfaceListModal = forwardRef<InterfaceListModalRef, InterfaceListModalProps>(
	({ interfaces }, ref) => {
		const [visible, setVisible] = useState(false);

		useImperativeHandle(ref, () => ({
			open: () => setVisible(true),
			close: () => setVisible(false)
		}));

		const columns: ColumnsType<RemoteInterface> = [
			{
				title: "接口ID",
				dataIndex: "id",
				key: "id",
				width: 100,
				render: text => <span className="text-gray-600">#{text}</span>
			},
			{
				title: "接口名称",
				dataIndex: "name",
				key: "name",
				width: 200,
				ellipsis: true,
				render: text => <span className="font-medium text-gray-800">{text}</span>
			},
			{
				title: "接口类型",
				dataIndex: "type",
				key: "type",
				width: 150,
				render: text => (
					<Tag color="blue" className="px-2 py-0.5 rounded-md">
						{text}
					</Tag>
				)
			}
		];

		return (
			<DraggableModal
				visible={visible}
				title="接口列表"
				onClose={() => setVisible(false)}
				width={600}
			>
				<Table<RemoteInterface>
					columns={columns}
					dataSource={interfaces}
					rowKey="id"
					pagination={{ pageSize: 5 }}
					size="small"
				/>
			</DraggableModal>
		);
	}
);

export default InterfaceListModal;
