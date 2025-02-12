import { ResUserDetail } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { createUser, getUserById, updateUserById } from "@/api/modules/user"; // 添加了createUser函数
import { ROLE_COLOR } from "@/enums";
import { HomeOutlined, PhoneOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Select, SelectProps, Space, Tag } from "antd";
import moment from "moment";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoDrawerProps {
	onSave?: (values: ResUserDetail) => void;
}
export interface InfoDrawerRef {
	open: (type?: "view" | "edit" | "add", user_id?: number | string) => void; // 增加"add"模式
}

const InfoDrawer = forwardRef<InfoDrawerRef, InfoDrawerProps>(({ onSave }, ref) => {
	const [type, setType] = useState<"view" | "edit" | "add">("view"); // 增加"add"模式
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

	// 获取用户信息并设置表单
	const fetchData = async (user_id?: number | string) => {
		setLoading(true);
		try {
			const resDict = await getRoleDict();
			if (resDict.code !== 200 || !resDict.data) throw new Error(resDict.message);

			setRoleOptions(
				resDict.data.map(item => ({
					label: <Tag color={ROLE_COLOR[item.value as keyof typeof ROLE_COLOR]}>{item.value}</Tag>,
					value: item.key
				}))
			);

			if (user_id) {
				const resUser = await getUserById(user_id);
				if (resUser.code !== 200 || !resUser.data) throw new Error(resUser.message);
				setUserDetail(resUser.data);
				form.setFieldsValue(resUser.data);
			}
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	// 打开抽屉
	const handleOpen = (type: "view" | "edit" | "add" = "view", user_id?: number | string) => {
		setType(type);
		setOpen(true);

		if (type === "edit" || type === "view") {
			fetchData(user_id!); // 获取用户数据
		} else {
			// 新增模式，初始化为空字段
			fetchData();
			setUserDetail({
				id: 0,
				username: "",
				role_id: null as any,
				name: "",
				phone: "",
				address: "",
				createdAt: "",
				updatedAt: ""
			});
			form.setFieldsValue({
				id: 0,
				username: "",
				role_id: null,
				name: "",
				phone: "",
				address: "",
				createdAt: "",
				updatedAt: ""
			});
		}
	};

	// 关闭抽屉
	const handleClose = () => {
		setOpen(false);
	};

	// 保存用户
	const handleSave = async (values: ResUserDetail) => {
		setButtonLoading(true);
		try {
			if (type === "edit") {
				// 编辑模式
				const res = await updateUserById(userDetail.id, {
					username: values.username,
					address: values.address,
					name: values.name,
					phone: values.phone,
					role_id: values.role_id
				});
				if (res.code !== 200) throw new Error(res.message);
			} else if (type === "add") {
				// 新增模式
				const res = await createUser({
					username: values.username,
					name: values.name,
					phone: values.phone,
					address: values.address,
					role_id: values.role_id
				});
				if (res.code !== 201) throw new Error(res.message);
			}

			onSave?.(values);
			handleClose();
			message.success(type === "edit" ? "保存成功" : "新增成功");
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
			title={<p>{type === "edit" ? "编辑用户" : type === "add" ? "新增用户" : "查看用户"}</p>}
			placement="right"
			open={open}
			loading={drawerLoading}
			onClose={handleClose}
			extra={
				(type === "edit" || type === "add") && (
					<Space>
						<Button onClick={handleClose}>取消</Button>
						<Button type="primary" onClick={() => form.submit()} loading={buttonLoading}>
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
				initialValues={userDetail}
			>
				<Form.Item
					label="用户名"
					name="username"
					rules={[{ required: true, message: "请输入用户名" }]}
				>
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="角色" name="role_id" rules={[{ required: true, message: "请选择角色" }]}>
					<Select
						options={roleOptions}
						disabled={type === "view" || userDetail.username === "admin"}
					/>
				</Form.Item>

				<Form.Item label="姓名" name="name" rules={[{ required: true, message: "请输入姓名" }]}>
					<Input disabled={type === "view"} />
				</Form.Item>

				<Form.Item
					label="手机号"
					name="phone"
					rules={[{ required: true, message: "请输入手机号" }]}
				>
					<Input prefix={<PhoneOutlined />} disabled={type === "view"} />
				</Form.Item>

				<Form.Item label="住址" name="address" rules={[{ required: true, message: "请输入住址" }]}>
					<Input prefix={<HomeOutlined />} disabled={type === "view"} />
				</Form.Item>

				{/* 新增模式不显示创建时间 */}
				{type !== "add" && (
					<Form.Item label="创建时间" name="createdAt">
						<span>{moment(userDetail?.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
					</Form.Item>
				)}
			</Form>
		</Drawer>
	);
});

export default InfoDrawer;
