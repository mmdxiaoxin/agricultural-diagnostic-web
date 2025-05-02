import { ModelConfig } from "@/typings/model";
import { Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

const { Title, Paragraph } = Typography;

export interface ModelDetailModalRef {
	open: (model: ModelConfig) => void;
	close: () => void;
}

const ModelDetailModal = forwardRef<ModelDetailModalRef>((_, ref) => {
	const [open, setOpen] = useState(false);
	const [model, setModel] = useState<ModelConfig | null>(null);

	useImperativeHandle(ref, () => ({
		open: (model: ModelConfig) => {
			setModel(model);
			setOpen(true);
		},
		close: () => {
			setOpen(false);
			setModel(null);
		}
	}));

	if (!model) return null;

	return (
		<Modal
			title="模型详情"
			open={open}
			onCancel={() => setOpen(false)}
			width={{
				xs: "90%",
				sm: "90%",
				md: "70%",
				lg: "70%",
				xl: "60%",
				xxl: "60%"
			}}
			footer={null}
			destroyOnClose
		>
			<div className="space-y-6">
				{/* 基本信息 */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Title level={4} className="!mb-0">
							{model.name}
						</Title>
						<Space>
							<Tag
								color={model.model_type === "yolo" ? "blue" : "green"}
								className="px-3 py-1 rounded-full"
							>
								{`${model.model_type.toUpperCase()}${model.model_version.toUpperCase()}`}
							</Tag>
							<Tag color={model.status === "active" ? "green" : "red"}>
								{model.status === "active" ? "已激活" : "未激活"}
							</Tag>
						</Space>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<div className="text-sm text-gray-500 mb-1">版本</div>
							<div className="text-base">v{model.version}</div>
						</div>
						<div>
							<div className="text-sm text-gray-500 mb-1">创建时间</div>
							<div className="text-base">
								{dayjs(model.createdAt).format("YYYY-MM-DD HH:mm:ss")}
							</div>
						</div>
					</div>

					{model.description && (
						<div>
							<div className="text-sm text-gray-500 mb-1">描述</div>
							<Paragraph className="!mb-0">{model.description}</Paragraph>
						</div>
					)}
				</div>

				{/* 模型参数 */}
				<div>
					<Title level={5} className="!mb-4">
						模型参数
					</Title>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Object.entries(model.parameters).map(([key, value]) => (
							<div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
								<div className="text-sm font-medium text-gray-500 mb-1">{key}</div>
								<div className="text-base font-mono text-gray-800">
									{typeof value === "boolean" ? (
										<Tag color={value ? "green" : "red"}>{value ? "true" : "false"}</Tag>
									) : (
										value?.toString() || "-"
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* 文件路径 */}
				<div>
					<Title level={5} className="!mb-4">
						文件信息
					</Title>
					<div className="space-y-2">
						<div>
							<div className="text-sm text-gray-500 mb-1">权重文件路径</div>
							<Paragraph className="!mb-0 font-mono text-sm">{model.weightPath}</Paragraph>
						</div>
						{model.configPath && (
							<div>
								<div className="text-sm text-gray-500 mb-1">配置文件路径</div>
								<Paragraph className="!mb-0 font-mono text-sm">{model.configPath}</Paragraph>
							</div>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
});

ModelDetailModal.displayName = "ModelDetailModal";

export default ModelDetailModal;
