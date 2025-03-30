import { RemoteConfig, RemoteInterface } from "@/api/interface";
import { createRemoteConfig, updateRemoteConfig } from "@/api/modules";
import MonacoEditor from "@/components/Editor";
import { Button, Form, Input, Modal, Select, Space, message } from "antd";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import InterfaceListModal, { InterfaceListModalRef } from "./InterfaceListModal";

export type ConfigModalProps = {
	onSuccess?: () => void;
	interfaces?: RemoteInterface[];
};

export type ConfigModalRef = {
	open: (mode: "create" | "edit", values?: RemoteConfig) => void;
	close: () => void;
};

const ConfigModal = forwardRef<ConfigModalRef, ConfigModalProps>(
	({ onSuccess, interfaces = [] }, ref) => {
		const [form] = Form.useForm();
		const [isModalVisible, setIsModalVisible] = useState(false);
		const [modalMode, setModalMode] = useState<"create" | "edit">("create");
		const [configContent, setConfigContent] = useState<string>("{}");
		const [loading, setLoading] = useState(false);
		const [serviceId, setServiceId] = useState(0);
		const interfaceModalRef = useRef<InterfaceListModalRef>(null);

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
			setServiceId(values?.id || 0);

			if (values) {
				form.setFieldsValue(values);
				try {
					const configStr =
						typeof values.config === "string"
							? values.config
							: JSON.stringify(values.config, null, 2);
					setConfigContent(configStr);
				} catch (error) {
					setConfigContent("{}");
				}
			} else {
				form.resetFields();
				setConfigContent("{}");
			}
		};

		const handleClose = () => {
			setIsModalVisible(false);
			form.resetFields();
			setConfigContent("{}");
			setLoading(false);
			interfaceModalRef.current?.close();
		};

		const handleSave = async (values: any) => {
			if (!serviceId) {
				message.error("服务ID不能为空");
				return;
			}

			try {
				setLoading(true);
				const config = JSON.parse(configContent);
				const submitData = {
					...values,
					config
				};

				if (modalMode === "edit" && values.id) {
					await updateRemoteConfig(serviceId, values.id, submitData);
					message.success("更新配置成功");
				} else {
					await createRemoteConfig(serviceId, submitData);
					message.success("添加配置成功");
				}

				onSuccess?.();
				handleClose();
			} catch (error) {
				message.error(modalMode === "edit" ? "更新配置失败" : "添加配置失败");
				console.error("保存失败:", error);
			} finally {
				setLoading(false);
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

								<Form.Item
									label="配置状态"
									name="status"
									rules={[{ required: true, message: "请选择配置状态" }]}
								>
									<Select
										placeholder="请选择配置状态"
										options={[
											{ label: "启用", value: "active" },
											{ label: "禁用", value: "inactive" }
										]}
									/>
								</Form.Item>

								{/* 接口列表按钮 */}
								<Form.Item>
									<Button
										type="link"
										onClick={() => interfaceModalRef.current?.open()}
										className="px-0"
									>
										查看接口列表 ({interfaces.length})
									</Button>
								</Form.Item>
							</div>

							<div className="flex justify-end">
								<Space>
									<Button onClick={handleClose}>取消</Button>
									<Button type="primary" htmlType="submit" loading={loading}>
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
				<InterfaceListModal ref={interfaceModalRef} interfaces={interfaces} />
			</Modal>
		);
	}
);

export default ConfigModal;
