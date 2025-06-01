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
			title="服务调用配置说明"
			placement="right"
			onClose={() => setOpen(false)}
			open={open}
			width={500}
		>
			<Typography>
				<Title level={4}>💡 基本说明</Title>
				<Paragraph>
					服务调用配置用于定义接口的调用方式和执行流程。配置包含顶层结构和请求配置两部分，支持单次请求和轮询请求两种模式。
				</Paragraph>

				<Title level={4}>📝 配置格式</Title>
				<Paragraph>
					<Text strong>顶层配置结构：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "result": 2,  // 可选，指定最终结果输出的请求ID
  "requests": [ // 请求配置数组
    // 请求配置项...
  ]
}`}
					</pre>
				</Paragraph>

				<Paragraph>
					<Text strong>单次请求配置示例：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "id": 5,
  "next": [2],
  "type": "single",
  "order": 1,
  "params": {
    "file": "image",
    "version": "1.0",
    "model_name": "resnet50"
  }
}`}
					</pre>
				</Paragraph>

				<Paragraph>
					<Text strong>轮询请求配置示例：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "id": 2,
  "type": "polling",
  "delay": 1000,
  "order": 2,
  "params": {
    "taskId": "{{#5.data.task_id}}"
  },
  "timeout": 100000,
  "interval": 5000,
  "maxAttempts": 5,
  "pollingCondition": {
    "field": "data.status",
    "value": "success",
    "operator": "equals"
  }
}`}
					</pre>
				</Paragraph>

				<Paragraph>
					<Text strong>完整配置示例：</Text>
					<pre className="bg-gray-50 p-4 rounded-lg mt-2">
						{`{
  "result": 2,
  "requests": [
    {
      "id": 5,
      "next": [2],
      "type": "single",
      "order": 1,
      "params": {
        "file": "image",
        "version": "1.0",
        "model_name": "resnet50"
      }
    },
    {
      "id": 2,
      "type": "polling",
      "delay": 1000,
      "order": 2,
      "params": {
        "taskId": "{{#5.data.task_id}}"
      },
      "timeout": 100000,
      "interval": 5000,
      "maxAttempts": 5,
      "pollingCondition": {
        "field": "data.status",
        "value": "success",
        "operator": "equals"
      }
    }
  ]
}`}
					</pre>
				</Paragraph>

				<Title level={4}>⚙️ 配置字段说明</Title>
				<Paragraph>
					<Text strong>顶层字段：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>result: 可选，指定最终结果输出的请求ID</li>
						<li>requests: 请求配置数组，包含所有请求的配置信息</li>
					</ul>
				</Paragraph>

				<Paragraph>
					<Text strong>请求配置字段：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>id: 服务接口ID</li>
						<li>order: 请求执行顺序</li>
						<li>type: 请求类型（single/polling）</li>
						<li>timeout: 请求超时时间（毫秒）</li>
						<li>retryCount: 重试次数</li>
						<li>retryDelay: 重试间隔（毫秒）</li>
						<li>delay: 请求前延迟（毫秒）</li>
						<li>next: 后续请求ID列表</li>
						<li>params: 请求参数</li>
					</ul>
				</Paragraph>

				<Paragraph>
					<Text strong>轮询特有字段：</Text>
					<ul className="list-disc list-inside mt-2">
						<li>interval: 轮询间隔（毫秒）</li>
						<li>maxAttempts: 最大轮询次数</li>
						<li>pollingCondition: 轮询终止条件</li>
					</ul>
				</Paragraph>

				<Title level={4}>🔍 轮询条件说明</Title>
				<Paragraph>
					轮询条件（pollingCondition）用于定义轮询终止的判断条件：
					<ul className="list-disc list-inside mt-2">
						<li>field: 响应数据中的字段名</li>
						<li>
							operator:
							比较操作符（equals/notEquals/contains/greaterThan/lessThan/exists/notExists）
						</li>
						<li>value: 比较目标值</li>
					</ul>
				</Paragraph>

				<Title level={4}>💪 最佳实践</Title>
				<Paragraph>
					<ul className="list-disc list-inside">
						<li>合理设置请求顺序（order）和后续请求（next）以构建正确的执行流程</li>
						<li>根据业务需求选择合适的请求类型（单次/轮询）</li>
						<li>设置合理的超时时间和重试机制</li>
						<li>轮询请求建议设置最大尝试次数，避免无限轮询</li>
						<li>使用轮询条件及时终止轮询，提高效率</li>
					</ul>
				</Paragraph>
			</Typography>
		</Drawer>
	);
});

export default ConfigHelpDrawer;
