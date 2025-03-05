import { AiService } from "@/api/interface";
import { getServiceList } from "@/api/modules";
import { Button, Flex, List, Skeleton, Tooltip, Typography } from "antd";
import React, { useEffect, useState } from "react";

export type ServiceListProps = {
	onSelect?: (service: AiService) => void;
};

export type ServiceListItem = AiService & {
	loading: boolean;
};

export type ServiceListState = ServiceListItem[];

const pageSize = 5;

const ServiceList: React.FC<ServiceListProps> = () => {
	const [serviceList, setServiceList] = useState<ServiceListState>([]);
	const [initLoading, setInitLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	const onLoadMore = () => {
		setLoading(true);
		setServiceList(prevList => prevList.concat(Array(pageSize).fill({ loading: true })));
		const nextPage = currentPage + 1;
		getServiceList({ page: nextPage, pageSize })
			.then(response => {
				if (response.code === 200 && response.data) {
					const newServiceList = serviceList.concat(
						response.data?.list.map(service => ({ ...service, loading: false })) || []
					);
					setServiceList(newServiceList);
					window.dispatchEvent(new Event("resize"));
					setCurrentPage(nextPage); // 更新 currentPage

					// 判断是否有更多数据
					if (newServiceList.length < pageSize) {
						setHasMore(false);
					}
				}
			})
			.catch(error => {
				console.error("加载更多失败", error);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const loadMore =
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
		) : null;

	const fetchServiceList = async () => {
		setInitLoading(true);
		try {
			const response = await getServiceList({ page: currentPage, pageSize });
			if (response.code === 200 && response.data) {
				setServiceList(
					response.data.list.map((service: AiService) => ({ ...service, loading: false })) || []
				);
				setCurrentPage(2); // 初始化时设置为2

				// 判断是否有更多数据
				if (response.data.list.length < pageSize) {
					setHasMore(false); // 没有更多数据了
				}
			}
		} catch (error) {
			console.error("初始化加载失败", error);
		} finally {
			setInitLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceList();
		setHasMore(true);
	}, []);

	return (
		<List
			rowKey={"serviceId"}
			header={
				<Flex align="center" justify="space-between">
					<Typography.Title level={4}>AI 服务列表</Typography.Title>
				</Flex>
			}
			loading={initLoading}
			itemLayout="horizontal"
			dataSource={serviceList}
			loadMore={loadMore}
			renderItem={item => (
				<List.Item>
					<Skeleton avatar title={false} loading={item.loading} active>
						<List.Item.Meta
							title={
								<Tooltip title={item.serviceName}>
									<Typography.Text ellipsis>{item.serviceName}</Typography.Text>
								</Tooltip>
							}
							description={
								<Flex>
									<Typography.Text type="secondary">{item.serviceType}</Typography.Text>
									<Typography.Text type="secondary">{item.status}</Typography.Text>
								</Flex>
							}
						/>
					</Skeleton>
				</List.Item>
			)}
		/>
	);
};

export default ServiceList;
