import { AiService } from "@/api/interface";
import ServiceList from "@/components/List/ServiceList";
import ServiceDetail from "@/components/ServiceDetail";
import { Empty, Splitter } from "antd";
import clsx from "clsx";
import React, { useState } from "react";

const ServiceConfig: React.FC = () => {
	const [service, setService] = useState<AiService>();

	return (
		<Splitter className={clsx("w-full h-full", "bg-white", "rounded-lg")}>
			<Splitter.Panel defaultSize="40%" min="20%" max="50%%" collapsible>
				<div className={clsx("w-full h-full", "p-4")}>
					<ServiceList selected={service} onSelect={service => setService(service)} />
				</div>
			</Splitter.Panel>
			<Splitter.Panel>
				{service ? (
					<ServiceDetail service={service} />
				) : (
					<div className={clsx("w-full h-full", "flex items-center justify-center")}>
						<Empty description="请选择一个服务" />
					</div>
				)}
			</Splitter.Panel>
		</Splitter>
	);
};

export default ServiceConfig;
