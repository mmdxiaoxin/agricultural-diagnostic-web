import { RemoteConfig, RemoteInterface } from "@/api/interface";
import { createRemoteConfig, updateRemoteConfig } from "@/api/modules";
import { Button, Form, Input, message, Modal, Select, Space, Spin, Tooltip, Tour } from "antd";
import type { TourProps } from "antd";
import { QuestionCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import clsx from "clsx";
import React, { forwardRef, Suspense, useImperativeHandle, useRef, useState } from "react";
import InterfaceListModal, { InterfaceListModalRef } from "./InterfaceListModal";
import { DEFAULT_CONFIG_TEMPLATE } from "@/constants/configTemplate";

// 使用 React.lazy 动态导入 Monaco Editor
const MonacoEditor = React.lazy(() =>
	import("@/components/MonacoEditor").then(async module => {
		// 配置 monaco loader
		const { loader } = await import("@monaco-editor/react");
		loader.config({
			paths: {
				vs: "/monaco-editor/min/vs"
			}
		});

		// 配置 worker
		(window as any).MonacoEnvironment = {
			getWorkerUrl: function (_moduleId: any, label: string) {
				switch (label) {
					case "json":
						return "/monaco-editor/min/vs/language/json/jsonWorker.js";
					case "javascript":
					case "typescript":
						return "/monaco-editor/min/vs/language/typescript/tsWorker.js";
					case "html":
					case "handlebars":
					case "razor":
						return "/monaco-editor/min/vs/language/html/htmlWorker.js";
					case "css":
					case "scss":
					case "less":
						return "/monaco-editor/min/vs/language/css/cssWorker.js";
					default:
						return "/monaco-editor/min/vs/editor/editor.main.js";
				}
			}
		};
		return module;
	})
);

export type ConfigModalProps = {
	onSuccess?: () => void;
	interfaces?: RemoteInterface[];
};

export type ConfigModalRef = {
	open: (mode: "create" | "edit", serviceId: number, values?: RemoteConfig) => void;
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

		// Tour 相关状态
		const [tourOpen, setTourOpen] = useState<boolean>(false);
		const nameRef = useRef<HTMLDivElement>(null);
		const descriptionRef = useRef<HTMLDivElement>(null);
		const statusRef = useRef<HTMLDivElement>(null);
		const interfaceListRef = useRef<HTMLDivElement>(null);
		const configEditorRef = useRef<HTMLDivElement>(null);
		const templateRef = useRef<HTMLButtonElement>(null);

		// Tour 步骤配置
		const steps: TourProps["steps"] = [
			{
				title: "配置名称",
				description: "在这里输入配置的名称，用于标识不同的配置",
				target: () => nameRef.current as HTMLElement
			},
			{
				title: "配置描述",
				description: "添加配置的详细描述，帮助其他用户理解配置的用途",
				target: () => descriptionRef.current as HTMLElement
			},
			{
				title: "配置状态",
				description: "选择配置的状态，可以启用或禁用该配置",
				target: () => statusRef.current as HTMLElement
			},
			{
				title: "接口列表",
				description: "查看和管理与该配置相关的接口列表",
				target: () => interfaceListRef.current as HTMLElement
			},
			{
				title: "配置模板",
				description: "使用预设的配置模板快速创建配置",
				target: () => templateRef.current as HTMLElement
			},
			{
				title: "配置编辑器",
				description: "在这里编辑配置的具体内容，支持 JSON 格式",
				target: () => configEditorRef.current as HTMLElement
			}
		];

		useImperativeHandle(
			ref,
			() => ({
				open: handleOpen,
				close: handleClose
			}),
			[]
		);

		const handleOpen = (mode: "create" | "edit", serviceId: number, values?: RemoteConfig) => {
			setModalMode(mode);
			setIsModalVisible(true);
			setServiceId(serviceId);

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
			try {
				setLoading(true);
				const config = JSON.parse(configContent);
				const submitData = {
					...values,
					config
				};

				if (modalMode === "edit" && values.id) {
					if (!serviceId) {
						message.error("服务ID不能为空");
						return;
					}
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
				width={{
					xs: "95%",
					sm: "90%",
					md: "85%",
					lg: "80%",
					xl: "70%",
					xxl: "60%"
				}}
				className="lg:top-10"
			>
				<Form form={form} onFinish={handleSave} layout="vertical">
					<div
						className={clsx(
							"flex flex-col lg:flex-row",
							"gap-4 lg:gap-6",
							"lg:h-[calc(100vh-200px)]"
						)}
					>
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
									<div ref={nameRef}>
										<Input placeholder="请输入配置名称" />
									</div>
								</Form.Item>

								<Form.Item label="配置描述" name="description">
									<div ref={descriptionRef}>
										<Input.TextArea placeholder="请输入配置描述" rows={4} className="resize-none" />
									</div>
								</Form.Item>

								<Form.Item
									label="配置状态"
									name="status"
									rules={[{ required: true, message: "请选择配置状态" }]}
								>
									<div ref={statusRef}>
										<Select
											placeholder="请选择配置状态"
											options={[
												{ label: "启用", value: "active" },
												{ label: "禁用", value: "inactive" }
											]}
										/>
									</div>
								</Form.Item>

								{/* 接口列表按钮 */}
								<Form.Item>
									<div ref={interfaceListRef}>
										<Button
											type="link"
											onClick={() => interfaceModalRef.current?.open()}
											className="px-0"
										>
											查看接口列表 ({interfaces.length})
										</Button>
									</div>
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
						<div
							className={clsx(
								"lg:flex-1",
								"border-t lg:border-t-0 lg:border-l",
								"border-gray-100",
								"flex flex-col",
								"h-[500px] lg:h-auto"
							)}
						>
							<div className="mb-4">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-medium text-gray-800">配置内容</h3>
									<Space>
										<Tooltip title="使用模板">
											<Button
												type="primary"
												icon={<FileTextOutlined />}
												onClick={() => {
													setConfigContent(JSON.stringify(DEFAULT_CONFIG_TEMPLATE, null, 2));
												}}
												ref={templateRef}
											/>
										</Tooltip>
										<Tooltip title="使用帮助">
											<Button
												type="primary"
												icon={<QuestionCircleOutlined />}
												onClick={() => setTourOpen(true)}
											/>
										</Tooltip>
									</Space>
								</div>
							</div>
							<div className={clsx("flex-1", "w-full")} ref={configEditorRef}>
								<Suspense fallback={<Spin size="large" tip="加载编辑器中..." />}>
									<MonacoEditor
										language="json"
										value={configContent}
										onChange={value => setConfigContent(value)}
										options={{
											minimap: { enabled: true },
											fontSize: 14,
											wordWrap: "on",
											scrollBeyondLastLine: false,
											automaticLayout: true,
											scrollbar: {
												vertical: "auto",
												horizontal: "auto",
												useShadows: false,
												verticalScrollbarSize: 8,
												horizontalScrollbarSize: 8
											}
										}}
										height="100%"
									/>
								</Suspense>
							</div>
						</div>
					</div>
				</Form>
				<InterfaceListModal ref={interfaceModalRef} interfaces={interfaces} />
				<Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={steps} />
			</Modal>
		);
	}
);

export default ConfigModal;
