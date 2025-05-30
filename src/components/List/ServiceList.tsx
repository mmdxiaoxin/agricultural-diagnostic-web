import { RemoteService } from "@/api/interface";
import { getRemotesList } from "@/api/modules";
import { Avatar, Button, Flex, List, Skeleton, Tooltip, Typography } from "antd";
import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import ServiceFilter from "../ServiceFilter";
import { AvatarColorMapper, StatusMapper } from "@/constants";

export type ServiceListProps = {
	selected?: RemoteService | null;
	onSelect?: (service: RemoteService) => void;
};

export type ServiceListItem = RemoteService & {
	loading: boolean;
};

export type ServiceListState = ServiceListItem[];

const pageSize = 5;

const ServiceList: React.FC<ServiceListProps> = ({ onSelect, selected }) => {
	const [serviceList, setServiceList] = useState<ServiceListState>([]);
	const [initLoading, setInitLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);

	const hasMore = useMemo(() => currentPage < Math.ceil(total / pageSize), [currentPage, total]);

	const onLoadMore = () => {
		setLoading(true);
		setServiceList(prevList => prevList.concat(Array(pageSize).fill({ loading: true })));
		const nextPage = currentPage + 1;
		getRemotesList({ page: nextPage, pageSize })
			.then(response => {
				if (response.code === 200 && response.data) {
					const newServiceList = serviceList.concat(
						response.data?.list.map(service => ({ ...service, loading: false })) || []
					);
					setServiceList(newServiceList);
					window.dispatchEvent(new Event("resize"));
					setCurrentPage(nextPage);
				}
			})
			.catch(error => {
				console.error("加载更多失败", error);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const loadMore = useMemo(
		() =>
			!initLoading && !loading && hasMore ? (
				<div
					style={{
						textAlign: "center",
						marginTop: 12,
						height: 32,
						lineHeight: "32px"
					}}
				>
					<Button onClick={onLoadMore}>加载更多</Button>
				</div>
			) : null,
		[initLoading, loading, hasMore]
	);

	const initServiceList = async () => {
		setInitLoading(true);
		try {
			setServiceList(Array(pageSize).fill({ loading: true }));
			const response = await getRemotesList({ page: 1, pageSize });
			if (response.code === 200 && response.data) {
				setServiceList(
					response.data.list.map((service: RemoteService) => ({ ...service, loading: false })) || []
				);
				setTotal(response.data.total);
			}
		} catch (error) {
			console.error("初始化加载失败", error);
		} finally {
			setInitLoading(false);
		}
	};

	useEffect(() => {
		initServiceList();
	}, []);

	return (
		<List
			rowKey={"id"}
			header={
				<Flex align="center" justify="space-between">
					<Typography.Title level={4}>AI 服务列表</Typography.Title>
					<ServiceFilter />
				</Flex>
			}
			loading={initLoading}
			itemLayout="horizontal"
			dataSource={serviceList}
			loadMore={loadMore}
			renderItem={item => (
				<List.Item
					className={clsx(
						"hover:bg-gray-100 rounded-lg",
						"cursor-pointer",
						selected?.id === item.id && "bg-gray-100"
					)}
					onClick={() => onSelect?.(item)}
				>
					<Skeleton avatar title={false} loading={item.loading} active>
						<List.Item.Meta
							avatar={
								<Avatar className={clsx("border", AvatarColorMapper[item.status])}>
									{StatusMapper[item.status]}
								</Avatar>
							}
							title={
								<Tooltip title={item.serviceName}>
									<Typography.Text ellipsis>{item.serviceName}</Typography.Text>
								</Tooltip>
							}
							description={
								<Typography.Text type="secondary">服务类型: {item.serviceType}</Typography.Text>
							}
						/>
					</Skeleton>
				</List.Item>
			)}
		/>
	);
};

export default ServiceList;
