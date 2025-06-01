import { Drawer, Typography } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

const { Title, Paragraph, Text } = Typography;

export type ConfigHelpDrawerRef = {
	open: () => void;
	close: () => void;
	toggle: () => void;
};

const ConfigHelpDrawer = forwardRef<ConfigHelpDrawerRef>((_, ref) => {
	const [open, setOpen] = useState(false);

	useImperativeHandle(ref, () => ({
		open: () => setOpen(true),
		close: () => setOpen(false),
		toggle: () => setOpen(prev => !prev)
	}));

	return (
		<Drawer
			title="配置说明"
			placement="right"
			onClose={() => setOpen(false)}
			open={open}
			width={500}
		>
			<Typography>
				<Title level={4}>💡 基本说明</Title>
				<Paragraph>
					配置支持两种请求模式：单次请求和轮询请求。您可以根据实际需求选择合适的模式。
				</Paragraph>

				<Title level={4}>📝 配置格式</Title>
				<Paragraph>
					<Text strong>单次请求配置示例：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "type": "single",
  "url": "https://api.example.com/data",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  }
}`}
					</pre>
				</Paragraph>

				<Paragraph>
					<Text strong>轮询请求配置示例：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "type": "polling",
  "url": "https://api.example.com/status",
  "method": "GET",
  "interval": 5000,
  "timeout": 30000,
  "retries": 3
}`}
					</pre>
				</Paragraph>

				<Title level={4}>🔗 数据引用</Title>
				<Paragraph>
					您可以使用 {"{{#id.field}}"} 语法引用其他请求的结果。例如：
					<ul className="list-disc list-inside mt-2">
						<li>{"{{#request1.data}}"}: 引用 request1 的 data 字段</li>
						<li>{"{{#request2.status.code}}"}: 引用 request2 的 status.code 字段</li>
					</ul>
				</Paragraph>

				<Title level={4}>⚙️ 高级配置</Title>
				<Paragraph>
					<Text strong>轮询请求特有配置：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>interval: 轮询间隔（毫秒）</li>
						<li>timeout: 超时时间（毫秒）</li>
						<li>retries: 重试次数</li>
						<li>condition: 停止条件（可选）</li>
					</ul>
				</Paragraph>

				<Title level={4}>💪 最佳实践</Title>
				<Paragraph>
					<ul className="list-disc list-inside">
						<li>合理设置轮询间隔，避免过于频繁的请求</li>
						<li>使用超时和重试机制提高可靠性</li>
						<li>合理使用数据引用，避免循环依赖</li>
						<li>建议使用模板快速开始配置</li>
					</ul>
				</Paragraph>
			</Typography>
		</Drawer>
	);
});

export default ConfigHelpDrawer;
