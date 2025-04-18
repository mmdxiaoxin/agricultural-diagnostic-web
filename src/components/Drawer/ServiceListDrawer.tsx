import { RemoteService } from "@/api/interface";
import ServiceList from "@/components/List/ServiceList";
import { Drawer } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface ServiceListDrawerRef {
	open: () => void;
	close: () => void;
}

interface ServiceListDrawerProps {
	selected?: RemoteService;
	onSelect: (service: RemoteService) => void;
}

const ServiceListDrawer = forwardRef<ServiceListDrawerRef, ServiceListDrawerProps>(
	({ selected, onSelect }, ref) => {
		const [open, setOpen] = useState(false);

		useImperativeHandle(
			ref,
			() => ({
				open: () => setOpen(true),
				close: () => setOpen(false)
			}),
			[]
		);

		return (
			<Drawer
				title="服务列表"
				placement="left"
				onClose={() => setOpen(false)}
				open={open}
				width="80%"
				className="lg:hidden"
			>
				<ServiceList selected={selected} onSelect={onSelect} />
			</Drawer>
		);
	}
);

ServiceListDrawer.displayName = "ServiceListDrawer";

export default ServiceListDrawer;
