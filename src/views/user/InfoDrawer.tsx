import { ResUserDetail } from "@/api/interface";
import { getRoleDict } from "@/api/modules/role";
import { createUser, getUserById, updateUserById } from "@/api/modules/user"; // 添加了createUser函数
import { HomeOutlined, PhoneOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Select, SelectProps, Space } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoDrawerProps {
	onSave?: (values: ResUserDetail) => void;
}
export interface InfoDrawerRef {
	open: (type?: "view" | "edit" | "add", user_id?: number | string) => void;
}

const InfoDrawer = forwardRef<InfoDrawerRef, InfoDrawerProps>(({ onSave }, ref) => {
	const [type, setType] = useState<"view" | "edit" | "add">("view");
	const [open, setOpen] = useState(false);
	const [initLoading, setInitLoading] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [roleOptions, setRoleOptions] = useState<SelectProps["options"]>([]);

	const [form] = Form.useForm();

	const fetchRole = async () => {
		try {
			const response = await getRoleDict();
			if (response.code !== 200 || !response.data) throw new Error(response.message);
			setRoleOptions(
				response.data.map(item => ({
					label: item.value,
					value: item.key
				}))
			);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	// 获取用户信息并设置表单
	const fetchUser = async (user_id?: number | string) => {
		try {
			if (user_id) {
				const response = await getUserById(user_id);
				if (response.code !== 200 || !response.data) throw new Error(response.message);
				const roles = response.data.roles?.map(role => role.id);
				form.setFieldsValue({
					...response.data,
					roles
				});
			}
		} catch (error: any) {
			message.error(error.message);
		}
	};

	// 打开抽屉
	const handleOpen = (type: "view" | "edit" | "add" = "view", user_id?: number | string) => {
		setType(type);
		setOpen(true);

		if (type === "edit" || type === "view") {
			setInitLoading(true);
			Promise.all([fetchRole(), fetchUser(user_id!)]).finally(() => setInitLoading(false));
		} else {
			form.resetFields();
		}
	};

	// 关闭抽屉
	const handleClose = () => {
		setOpen(false);
	};

	// 保存用户
	const handleSave = async (values: any) => {
		setSaveLoading(true);
		try {
			if (type === "edit") {
				// 编辑模式
				const res = await updateUserById(values.id, values);
				if (res.code !== 200) throw new Error(res.message);
			} else if (type === "add") {
				// 新增模式
				const res = await createUser({
					username: values.username,
					name: values.name,
					phone: values.phone,
					address: values.address
				});
				if (res.code !== 201) throw new Error(res.message);
			}

			onSave?.(values);
			handleClose();
			message.success(type === "edit" ? "保存成功" : "新增成功");
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setSaveLoading(false);
		}
	};

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	return (
		<Drawer
			closable
			destroyOnClose
			title={<p>{type === "edit" ? "编辑用户" : type === "add" ? "新增用户" : "查看用户"}</p>}
			placement="right"
			open={open}
			loading={initLoading}
			onClose={handleClose}
			extra={
				(type === "edit" || type === "add") && (
					<Space>
						<Button onClick={handleClose}>取消</Button>
						<Button type="primary" onClick={() => form.submit()} loading={saveLoading}>
							{type === "add" ? "新增" : "保存"}
						</Button>
					</Space>
				)
			}
		>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				onFinish={handleSave}
			>
				<Form.Item label="邮箱" name="email">
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="用户名" name="username">
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="邮箱" name="roles">
					<Select mode="multiple" allowClear disabled={type === "view"} options={roleOptions} />
				</Form.Item>

				<Form.Item label="姓名" name={["profile", "name"]}>
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="手机号" name={["profile", "phone"]}>
					<Input prefix={<PhoneOutlined />} disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="住址" name={["profile", "address"]}>
					<Input prefix={<HomeOutlined />} disabled={type === "view"} />
				</Form.Item>
			</Form>
		</Drawer>
	);
});

export default InfoDrawer;
