import { ResUserDetail } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { getUserById, updateUserById } from "@/api/modules/user";
import { ROLE_COLOR } from "@/enums";
import { HomeOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Select, SelectProps, Space, Tag } from "antd";
import moment from "moment";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoDrawerProps {
	onSave?: (values: ResUserDetail) => void;
}
export interface InfoDrawerRef {
	open: (user_id: number | string, type?: "view" | "edit") => void;
}

const InfoDrawer = forwardRef<InfoDrawerRef, InfoDrawerProps>(({ onSave }, ref) => {
	const [type, setType] = useState<"view" | "edit">("view");
	const [open, setOpen] = useState(false);
	const [drawerLoading, setLoading] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [roleOptions, setRoleOptions] = useState<SelectProps["options"]>([]);
	const [userDetail, setUserDetail] = useState<ResUserDetail>({
		id: 0,
		username: "",
		role_id: 0,
		name: "",
		phone: "",
		address: "",
		createdAt: "",
		updatedAt: ""
	});

	const [form] = Form.useForm();

	const fetchData = async (user_id: number | string) => {
		setLoading(true);
		try {
			const resUser = await getUserById(user_id);
			if (resUser.code !== 200 || !resUser.data) throw new Error(resUser.message);

			const resDict = await getRoleDict();
			if (resDict.code !== 200 || !resDict.data) throw new Error(resDict.message);

			setRoleOptions(
				resDict.data.map(item => ({
					label: <Tag color={ROLE_COLOR[item.value as keyof typeof ROLE_COLOR]}>{item.value}</Tag>,
					value: item.key
				}))
			);
			setUserDetail(resUser.data);
			form.setFieldsValue(resUser.data);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleOpen = (user_id: number | string, type?: "view" | "edit") => {
		fetchData(user_id);
		setOpen(true);
		setType(type || "view");
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSave = async (values: ResUserDetail) => {
		// 保存逻辑
		setButtonLoading(true);
		try {
			const res = await updateUserById(userDetail.id, {
				address: values.address,
				name: values.name,
				phone: values.phone,
				role_id: values.role_id
			});
			if (res.code !== 200) throw new Error(res.message);

			onSave?.(values);
			handleClose();
			message.success("保存成功");
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setButtonLoading(false);
		}
	};

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	return (
		<Drawer
			closable
			destroyOnClose
			title={<p>{type === "edit" ? "编辑用户" : "查看用户"}</p>}
			placement="right"
			open={open}
			loading={drawerLoading}
			onClose={handleClose}
			extra={
				type === "edit" && (
					<Space>
						<Button onClick={handleClose}>取消</Button>
						<Button type="primary" onClick={() => form.submit()} loading={buttonLoading}>
							保存
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
				initialValues={userDetail}
			>
				<Form.Item label="用户名" name="username">
					<Space>
						<UserOutlined />
						{userDetail?.username}
					</Space>
				</Form.Item>

				<Form.Item label="角色" name="role_id">
					<Select
						options={roleOptions}
						disabled={type === "view" || userDetail.username === "admin"}
					/>
				</Form.Item>

				<Form.Item label="姓名" name="name">
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="手机号" name="phone">
					<Input prefix={<PhoneOutlined />} disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="住址" name="address">
					<Input prefix={<HomeOutlined />} disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="创建时间" name="createdAt">
					<span>{moment(userDetail?.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
				</Form.Item>
			</Form>
		</Drawer>
	);
});

export default InfoDrawer;
