import { Drawer, Table, Typography } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

const { Title, Paragraph, Text } = Typography;

export type InterfaceHelpDrawerRef = {
	open: () => void;
	close: () => void;
	toggle: () => void;
};

const InterfaceHelpDrawer = forwardRef<InterfaceHelpDrawerRef>((_, ref) => {
	const [open, setOpen] = useState(false);

	useImperativeHandle(ref, () => ({
		open: () => setOpen(true),
		close: () => setOpen(false),
		toggle: () => setOpen(prev => !prev)
	}));

	const configExampleData = [
		{
			key: "method",
			value: "POST"
		},
		{
			key: "prefix",
			value: "/api/v1"
		},
		{
			key: "path",
			value: "/diagnosis/result"
		},
		{
			key: "headers",
			value: `{
  "Authorization": "Bearer xxx",
  "Content-Type": "application/json"
}`
		},
		{
			key: "timeout",
			value: "5000"
		},
		{
			key: "contentType",
			value: "application/json"
		},
		{
			key: "responseType",
			value: "json"
		},
		{
			key: "maxContentLength",
			value: "1000000"
		},
		{
			key: "withCredentials",
			value: "true"
		}
	];

	const columns = [
		{
			title: "配置项",
			dataIndex: "key",
			width: "40%"
		},
		{
			title: "示例值",
			dataIndex: "value",
			width: "60%",
			render: (text: string) => {
				if (text.includes("{")) {
					return <pre className="bg-gray-50 p-2 rounded-lg">{text}</pre>;
				}
				return text;
			}
		}
	];

	return (
		<Drawer
			title="接口配置说明"
			placement="right"
			onClose={() => setOpen(false)}
			open={open}
			width={500}
		>
			<Typography>
				<Title level={4}>💡 基本说明</Title>
				<Paragraph>
					接口配置用于定义远程服务的调用方式和参数。您可以通过配置项来自定义接口的行为和特性。
				</Paragraph>

				<Title level={4}>📝 配置项说明</Title>
				<Paragraph>
					<Text strong>HTTP 请求方法：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>method: 指定 HTTP 请求方法</li>
						<li>可选值：GET、POST、PUT、DELETE</li>
					</ul>
				</Paragraph>

				<Paragraph>
					<Text strong>接口地址配置：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>prefix: 接口地址前缀，如 /api/v1</li>
						<li>path: 路径地址，如 /diagnosis/result</li>
					</ul>
				</Paragraph>

				<Paragraph>
					<Text strong>请求配置：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>headers: 自定义请求头，如 {"{ Authorization: Bearer xxx }"}</li>
						<li>timeout: 请求超时时间（毫秒），如 5000</li>
						<li>contentType: 请求内容类型，如 application/json、multipart/form-data</li>
						<li>responseType: 响应数据类型，如 json、text、blob、arraybuffer</li>
					</ul>
				</Paragraph>

				<Paragraph>
					<Text strong>高级配置：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>validateStatus: 状态码校验函数，如 (status) =&gt; status &lt; 500</li>
						<li>maxContentLength: 最大响应体大小（字节），如 1000000</li>
						<li>maxBodyLength: 最大请求体大小（字节）</li>
						<li>maxRedirects: 最大重定向次数</li>
						<li>withCredentials: 是否携带凭据（如 Cookie），可选值：true/false</li>
					</ul>
				</Paragraph>

				<Title level={4}>💪 最佳实践</Title>
				<Paragraph>
					<ul className="list-disc list-inside">
						<li>合理设置超时时间，避免请求长时间等待</li>
						<li>根据实际需求选择合适的请求方法和内容类型</li>
						<li>使用请求头传递认证信息，确保安全性</li>
						<li>设置合理的响应体大小限制，避免内存溢出</li>
						<li>对于需要跨域请求的场景，注意配置 withCredentials</li>
					</ul>
				</Paragraph>

				<Title level={4}>🔍 配置示例</Title>
				<Table
					columns={columns}
					dataSource={configExampleData}
					pagination={false}
					bordered
					size="small"
					className="mt-2"
				/>
			</Typography>
		</Drawer>
	);
});

export default InterfaceHelpDrawer;
