import { LinkOutlined } from "@ant-design/icons";
import { Button, Drawer, List, Typography } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

const { Paragraph } = Typography;

export type ExternalSourceDrawerProps = {
	onClick?: (url: string, name: string) => void;
};

export type ExternalSourceDrawerRef = {
	open: () => void;
	close: () => void;
};

const ExternalSourceDrawer = forwardRef<ExternalSourceDrawerRef, ExternalSourceDrawerProps>(
	({ onClick }, ref) => {
		const [open, setOpen] = useState(false);

		useImperativeHandle(ref, () => ({
			open: handleOpen,
			close: handleClose
		}));

		const handleOpen = () => {
			setOpen(true);
		};

		const handleClose = () => {
			setOpen(false);
		};

		const data = [
			{ name: "农业病虫害信息云数据库", url: "https://cloud.sinoverse.cn/index_bch.html" },
			{ name: "药用植物病虫害数据库", url: "https://www.pests.cn/" },
			{ name: "农业病虫草害图文数据库", url: "https://farm.sino-eco.com/website/bingchonghai" }
		];

		const handleItemClick = (url: string, name: string) => {
			if (onClick) {
				onClick(url, name);
			}
			handleClose();
		};

		return (
			<Drawer
				title="第三方病害知识库来源"
				onClose={handleClose}
				open={open}
				width={400}
				footer={null}
			>
				<List
					dataSource={data}
					renderItem={item => (
						<List.Item
							key={item.url}
							actions={[
								<Button
									icon={<LinkOutlined />}
									type="link"
									onClick={() => handleItemClick(item.url, item.name)}
								>
									访问
								</Button>
							]}
						>
							<List.Item.Meta
								title={
									<a href={item.url} target="_blank" rel="noopener noreferrer">
										{item.name}
									</a>
								}
								description={
									<Paragraph ellipsis={{ rows: 1, expandable: true }}>{item.url}</Paragraph>
								}
							/>
						</List.Item>
					)}
				/>
			</Drawer>
		);
	}
);

export default ExternalSourceDrawer;
