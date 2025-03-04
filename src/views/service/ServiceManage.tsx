import { AiService } from "@/api/interface/service";
import { getServices } from "@/api/modules";
import ServiceModal, { ServiceModalRef } from "@/components/Modal/ServiceModal";
import { CodepenOutlined } from "@ant-design/icons/lib/icons";
import { Button, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";

const ServiceManage: React.FC = () => {
	const [services, setServices] = useState<AiService[]>([]);
	const serviceModalRef = useRef<ServiceModalRef>(null);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

	const fetchServices = async () => {
		const response = await getServices({
			page: pagination.page,
			pageSize: pagination.pageSize
		});
		if (response.code === 200 && response.data) {
			setServices(response.data?.list || []);
			setPagination({
				...pagination,
				total: response.data?.total || 0
			});
		}
	};

	useEffect(() => {
		fetchServices();
	}, []);

	const handleEditService = (service: any) => {
		serviceModalRef.current?.open("edit", service);
	};

	const handleCreateService = () => {
		serviceModalRef.current?.open("create");
	};

	const columns: ColumnsType<AiService> = [
		{
			title: "服务名称",
			dataIndex: "serviceName",
			key: "serviceName"
		},
		{
			title: "服务类型",
			dataIndex: "serviceType",
			key: "serviceType"
		},
		{
			title: "服务状态",
			dataIndex: "status",
			key: "status"
		},
		{
			title: "操作",
			key: "actions",
			render: (_, record) => (
				<Button onClick={() => handleEditService(record)} type="primary" icon={<CodepenOutlined />}>
					编辑
				</Button>
			)
		}
	];

	return (
		<div className="w-full h-full p-4 bg-white rounded-lg">
			<Button onClick={handleCreateService} type="primary" style={{ marginBottom: 20 }}>
				创建服务
			</Button>
			<Table<AiService> columns={columns} dataSource={services} rowKey="serviceId" />
			<ServiceModal ref={serviceModalRef} />
		</div>
	);
};

export default ServiceManage;
