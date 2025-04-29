import React, { forwardRef, useImperativeHandle, useState } from "react";
import { DiagnosisSupport, ReqDiagnosisSupport } from "@/api/interface/diagnosis";
import { createDiagnosisSupport, updateDiagnosisSupport } from "@/api/modules/diagnosis";
import { Form, Input, Modal, message } from "antd";
import { ModalProps } from "antd/es/modal";

export interface DiagnosisSupportModalRef {
	open: (type: "add" | "edit", record?: DiagnosisSupport) => void;
}

interface DiagnosisSupportModalProps {
	onSave?: () => void;
}

const DiagnosisSupportModal = forwardRef<DiagnosisSupportModalRef, DiagnosisSupportModalProps>(
	({ onSave }, ref) => {
		const [visible, setVisible] = useState(false);
		const [loading, setLoading] = useState(false);
		const [form] = Form.useForm();
		const [type, setType] = useState<"add" | "edit">("add");
		const [currentRecord, setCurrentRecord] = useState<DiagnosisSupport>();

		useImperativeHandle(ref, () => ({
			open: (type, record) => {
				setType(type);
				setCurrentRecord(record);
				if (type === "edit" && record) {
					form.setFieldsValue({
						key: record.key,
						serviceId: record.value.serviceId,
						configId: record.value.configId,
						description: record.description
					});
				} else {
					form.resetFields();
				}
				setVisible(true);
			}
		}));

		const handleOk = async () => {
			try {
				const values = await form.validateFields();
				setLoading(true);

				const params: ReqDiagnosisSupport = {
					key: values.key,
					value: {
						serviceId: values.serviceId,
						configId: values.configId
					},
					description: values.description
				};

				if (type === "add") {
					await createDiagnosisSupport(params);
					message.success("添加成功");
				} else {
					await updateDiagnosisSupport(currentRecord!.id, params);
					message.success("更新成功");
				}

				setVisible(false);
				onSave?.();
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		const handleCancel = () => {
			setVisible(false);
			form.resetFields();
		};

		const modalProps: ModalProps = {
			title: type === "add" ? "添加诊断支持" : "编辑诊断支持",
			open: visible,
			onOk: handleOk,
			onCancel: handleCancel,
			confirmLoading: loading,
			destroyOnClose: true,
			width: 600
		};

		return (
			<Modal {...modalProps}>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						key: "",
						serviceId: undefined,
						configId: undefined,
						description: ""
					}}
				>
					<Form.Item
						name="key"
						label="配置名称"
						rules={[{ required: true, message: "请输入配置名称" }]}
					>
						<Input placeholder="请输入配置名称" />
					</Form.Item>
					<Form.Item
						name="serviceId"
						label="服务ID"
						rules={[{ required: true, message: "请输入服务ID" }]}
					>
						<Input type="number" placeholder="请输入服务ID" />
					</Form.Item>
					<Form.Item
						name="configId"
						label="配置ID"
						rules={[{ required: true, message: "请输入配置ID" }]}
					>
						<Input type="number" placeholder="请输入配置ID" />
					</Form.Item>
					<Form.Item name="description" label="描述">
						<Input.TextArea rows={4} placeholder="请输入描述信息" />
					</Form.Item>
				</Form>
			</Modal>
		);
	}
);

DiagnosisSupportModal.displayName = "DiagnosisSupportModal";

export default DiagnosisSupportModal;
