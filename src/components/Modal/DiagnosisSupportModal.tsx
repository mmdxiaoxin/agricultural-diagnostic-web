import { DiagnosisSupport, ReqDiagnosisSupport } from "@/api/interface/diagnosis";
import { RemoteService } from "@/api/interface/service";
import { createDiagnosisSupport, updateDiagnosisSupport } from "@/api/modules/diagnosis";
import ServiceCascader from "@/components/ServiceCascader";
import { Form, Input, Modal, message } from "antd";
import { ModalProps } from "antd/es/modal";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface DiagnosisSupportModalRef {
	open: (type: "add" | "edit", record?: DiagnosisSupport) => void;
}

interface DiagnosisSupportModalProps {
	serviceList: RemoteService[];
	onSave?: () => void;
}

const DiagnosisSupportModal = forwardRef<DiagnosisSupportModalRef, DiagnosisSupportModalProps>(
	({ serviceList, onSave }, ref) => {
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
						value: [record.value.serviceId, record.value.configId],
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
						serviceId: values.value[0],
						configId: values.value[1]
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
						value: undefined,
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
						name="value"
						label="服务配置"
						rules={[{ required: true, message: "请选择服务配置" }]}
					>
						<ServiceCascader serviceList={serviceList} />
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
