import { AiService } from "@/api/interface/service";
import { deleteService, getServices } from "@/api/modules";
import ServiceModal, { ServiceModalRef } from "@/components/Modal/ServiceModal";
import QuickCopy from "@/components/Table/QuickCopy";
import { CodepenOutlined } from "@ant-design/icons/lib/icons";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";

const ServiceManage: React.FC = () => {
	const [services, setServices] = useState<AiService[]>([]);
	const serviceModalRef = useRef<ServiceModalRef>(null);
	const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
	const [total, setTotal] = useState(0);

	const fetchServices = async (page: number = 1, pageSize: number = 10) => {
		const response = await getServices({ page, pageSize });
		if (response.code === 200 && response.data) {
			setServices(response.data.list || []);
			setTotal(response.data.total || 0);
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

	const handleDeleteService = async (serviceId: number) => {
		try {
			await deleteService(serviceId);
			setPagination({
				...pagination,
				page: 1
			});
			fetchServices(1, pagination.pageSize);
			message.success("删除服务成功");
		} catch (error) {
			message.error("删除服务失败");
		}
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
			title: "服务URL",
			dataIndex: "endpointUrl",
			key: "endpointUrl",
			render: text => <QuickCopy text={text} />
		},
		{
			title: "操作",
			key: "actions",
			align: "center",
			render: (_, record) => (
				<Space>
					<Button
						onClick={() => {
							const {
								aiServiceAccessLogs,
								aiServiceConfigs,
								aiServiceLogs,
								createdAt,
								updatedAt,
								...serviceData
							} = record;
							handleEditService(serviceData);
						}}
						type="primary"
						icon={<CodepenOutlined />}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该服务吗？"
						onConfirm={() => handleDeleteService(record.serviceId)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="primary" icon={<CodepenOutlined />} danger>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className="w-full h-full p-4 bg-white rounded-lg overflow-y-scroll">
			<Button onClick={handleCreateService} type="primary" style={{ marginBottom: 20 }}>
				创建服务
			</Button>
			<Table<AiService>
				columns={columns}
				dataSource={services}
				rowKey="serviceId"
				pagination={{
					current: pagination.page,
					pageSize: pagination.pageSize,
					total: total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: total => `共 ${total} 项`,
					onChange: (page, pageSize) => {
						setPagination({
							...pagination,
							page,
							pageSize
						});
						fetchServices(page, pageSize);
					}
				}}
			/>
			<ServiceModal
				ref={serviceModalRef}
				onSave={() => {
					fetchServices(pagination.page, pagination.pageSize);
				}}
			/>
		</div>
	);
};

export default ServiceManage;
