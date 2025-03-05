import { AiService } from "@/api/interface";
import { Typography } from "antd";
import React from "react";

export type ServiceDetailProps = {
	service?: AiService;
	onSave?: (service: AiService) => void;
};

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service }) => {
	return (
		<Typography.Title type="secondary" level={5} style={{ whiteSpace: "nowrap" }}>
			{service?.serviceName}
		</Typography.Title>
	);
};

export default ServiceDetail;
