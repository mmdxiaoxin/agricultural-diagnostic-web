import { RemoteConfig } from "@/api/interface";
import { Button, Form, Input, Modal, Select, Space, message } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import MonacoEditor from "@/components/Editor";

export type ConfigModalProps = {
	onSave?: (values: any) => void;
	onCancel?: () => void;
};

export type ConfigModalRef = {
	open: (mode: "create" | "edit", values?: RemoteConfig) => void;
	close: () => void;
};

const ConfigModal = forwardRef<ConfigModalRef, ConfigModalProps>(({ onCancel, onSave }, ref) => {
	const [form] = Form.useForm();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [configContent, setConfigContent] = useState<string>("{}");

	useImperativeHandle(
		ref,
		() => ({
			open: handleOpen,
			close: handleClose
		}),
		[]
	);

	const handleOpen = (mode: "create" | "edit", values?: RemoteConfig) => {
		setModalMode(mode);
		setIsModalVisible(true);
		if (values) {
			form.setFieldsValue(values);
			setConfigContent(JSON.stringify(values.config, null, 2));
		} else {
			setConfigContent("{}");
		}
	};

	const handleClose = () => {
		setIsModalVisible(false);
		form.resetFields();
		setConfigContent("{}");
		onCancel?.();
	};

	const handleSave = async (values: any) => {
		try {
			const config = JSON.parse(configContent);
			const submitData = {
				...values,
				config
			};

			onSave?.(submitData);
			handleClose();
		} catch (error) {
			message.error("配置格式不正确，请检查 JSON 格式");
			console.error("保存失败:", error);
		}
	};

	return (
		<Modal
			title={modalMode === "edit" ? "编辑配置" : "添加配置"}
			open={isModalVisible}
			onCancel={handleClose}
			footer={null}
			width={1000}
			className="config-modal"
		>
			<Form form={form} onFinish={handleSave} layout="vertical">
				<div className="flex gap-6">
					{/* 左侧基本信息 */}
					<div className="flex-1">
						<div className="mb-6">
							<h3 className="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
							<Form.Item name="id" hidden />
							<Form.Item
								label="配置名称"
								name="name"
								rules={[{ required: true, message: "请输入配置名称" }]}
							>
								<Input placeholder="请输入配置名称" />
							</Form.Item>

							<Form.Item label="配置描述" name="description">
								<Input.TextArea placeholder="请输入配置描述" rows={4} className="resize-none" />
							</Form.Item>

							<Form.Item label="配置状态" name="status">
								<Select
									placeholder="请选择配置状态"
									options={[
										{ label: "启用", value: "active" },
										{ label: "禁用", value: "inactive" }
									]}
								/>
							</Form.Item>
						</div>

						<div className="flex justify-end">
							<Space>
								<Button onClick={handleClose}>取消</Button>
								<Button type="primary" htmlType="submit">
									保存
								</Button>
							</Space>
						</div>
					</div>

					{/* 右侧配置编辑器 */}
					<div className="flex-1 border-l border-gray-100 pl-6">
						<div className="mb-4">
							<h3 className="text-lg font-medium text-gray-800">配置内容</h3>
						</div>
						<MonacoEditor
							language="json"
							value={configContent}
							onChange={value => setConfigContent(value)}
							options={{
								minimap: { enabled: true },
								fontSize: 14,
								wordWrap: "on",
								scrollBeyondLastLine: false
							}}
						/>
					</div>
				</div>
			</Form>
		</Modal>
	);
});

export default ConfigModal;
