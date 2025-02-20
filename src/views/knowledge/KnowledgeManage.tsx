import KnowledgeModal, { KnowledgeModalRef } from "@/components/KnowledgeModel";
import { AppstoreAddOutlined, FileDoneOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Layout, Row, Table, Tooltip, Tree, Typography } from "antd";
import React, { useRef, useState } from "react";
import styles from "./KnowledgeManage.module.scss";

// 假设的作物数据和病虫害数据
const cropData = [
	{
		key: "1",
		title: "禾本科",
		children: [
			{ key: "1-1", title: "小麦" },
			{ key: "1-2", title: "大麦" },
			{ key: "1-3", title: "玉米" }
		]
	},
	{
		key: "2",
		title: "薯类",
		children: [
			{ key: "2-1", title: "甘薯" },
			{ key: "2-2", title: "马铃薯" }
		]
	},
	{
		key: "3",
		title: "纤维类",
		children: [
			{ key: "3-1", title: "棉花" },
			{ key: "3-2", title: "亚麻" }
		]
	}
];

const { Sider, Content } = Layout;
const { Title } = Typography;

export type KnowledgeManageProps = {};

const KnowledgeManage: React.FC<KnowledgeManageProps> = () => {
	const knowledgeRef = useRef<KnowledgeModalRef>(null);

	const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

	// Tree选中事件
	const onSelect = (selectedKeys: React.Key[]) => {
		const selectedTitle = selectedKeys[0] as string;
		setSelectedCrop(selectedTitle);
	};

	const onAddKnowledge = () => {
		knowledgeRef.current?.open("add");
	};

	// 表格数据
	const columns = [
		{ title: "类型", dataIndex: "type", key: "type" },
		{ title: "名称", dataIndex: "name", key: "name" }
	];

	return (
		<Layout className={styles["container"]}>
			<KnowledgeModal ref={knowledgeRef} />
			<Sider theme="light" className={styles["sider"]} width={300}>
				<Title level={4}>作物分类</Title>
				<Tree
					showLine
					defaultExpandedKeys={["1", "2", "3"]}
					onSelect={onSelect}
					treeData={cropData}
				/>
			</Sider>

			<Layout>
				<Content style={{ background: "#fff", margin: 0, minHeight: 280 }}>
					{selectedCrop ? (
						<>
							<Title level={4}>{selectedCrop} 的病虫害信息</Title>
							<Row gutter={24}>
								<Col span={24}>
									<Card
										title="病虫害类型"
										extra={
											<Tooltip title="新增病虫害信息">
												<Button
													icon={<AppstoreAddOutlined />}
													type="text"
													onClick={onAddKnowledge}
												/>
											</Tooltip>
										}
										style={{ borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
									>
										<Table
											rowKey="id"
											columns={columns}
											// dataSource={dataSource}
											pagination={false}
											size="middle"
											style={{ borderRadius: "8px" }}
										/>
									</Card>
								</Col>
							</Row>
						</>
					) : (
						<Flex align="center" justify="center" style={{ height: "100%" }}>
							<FileDoneOutlined style={{ fontSize: 48, color: "#ccc" }} />
							<p>请选择作物分类</p>
						</Flex>
					)}
				</Content>
			</Layout>
		</Layout>
	);
};

export default KnowledgeManage;
