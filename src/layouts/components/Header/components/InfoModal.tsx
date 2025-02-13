import { ResUserProfile } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { getUserProfile, updateUserProfile } from "@/api/modules/user";
import { ROLE_COLOR } from "@/constants";
import { HomeOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Space, Tag } from "antd";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoModalProps {
	onSave?: (values: UserForm) => void;
}
export interface InfoModalRef {
	open: () => void;
}

type UserForm = {
	role: string;
} & ResUserProfile;

const InfoModal = forwardRef<InfoModalRef, InfoModalProps>(({ onSave }, ref) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [formData, setFormData] = useState<UserForm>({
		username: "",
		role_id: 0,
		role: "",
		name: "",
		phone: "",
		address: "",
		createdAt: ""
	});

	const [isEditing, setIsEditing] = useState(false);

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	const fetchUser = () => {
		try {
			Promise.all([getUserProfile(), getRoleDict()]).then(([userRes, roleRes]) => {
				if (userRes.code !== 200 || !userRes.data) throw new Error(userRes.message);
				const user = userRes.data;
				const role = roleRes.data?.find(item => item.key === user.role_id);
				if (!role) throw new Error("未找到角色信息");

				setFormData({
					...user,
					role: role.value
				});
				setModalVisible(true);
			});
		} catch (error) {
			message.error("获取用户信息失败");
		}
	};

	const handleOpen = () => {
		fetchUser();
	};

	const handleOk = () => {
		handleSave(formData);
		setModalVisible(false);
	};

	const handleCancel = () => {
		setModalVisible(false);
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async (values: UserForm) => {
		try {
			const newInfo = {
				name: values.name,
				phone: values.phone,
				address: values.address
			};
			const res = await updateUserProfile(newInfo);
			if (res.code !== 200) throw new Error(res.message);

			setFormData({ ...formData, ...newInfo });
			onSave?.(values);
			setIsEditing(false);
			message.success("修改用户信息成功 🎉🎉🎉");
		} catch (error: any) {
			message.error("更新用户信息失败: " + error.message);
		}
	};

	return (
		<Modal
			title="个人信息"
			open={modalVisible}
			onOk={handleOk}
			onCancel={handleCancel}
			destroyOnClose={true}
			footer={
				isEditing ? (
					<>
						<Button onClick={() => setIsEditing(false)}>取消编辑</Button>
						<Button type="primary" onClick={handleOk}>
							保存信息
						</Button>
					</>
				) : (
					<Button type="primary" onClick={handleEdit}>
						编辑
					</Button>
				)
			}
		>
			<Form
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				onFinish={handleSave}
				initialValues={formData}
			>
				<Form.Item label="用户名" name="username">
					<Space>
						<UserOutlined />
						{formData.username}
					</Space>
				</Form.Item>

				<Form.Item label="角色" name="role">
					<Tag color={ROLE_COLOR[formData.role as keyof typeof ROLE_COLOR] || "default"}>
						{formData.role}
					</Tag>
				</Form.Item>

				<Form.Item label="姓名" name="name">
					<Input
						disabled={!isEditing}
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="手机号" name="phone">
					<Input
						prefix={<PhoneOutlined />}
						disabled={!isEditing}
						value={formData.phone}
						onChange={e => setFormData({ ...formData, phone: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="住址" name="address">
					<Input
						prefix={<HomeOutlined />}
						disabled={!isEditing}
						value={formData.address}
						onChange={e => setFormData({ ...formData, address: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="创建时间" name="createdAt">
					<span>{dayjs(formData.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
				</Form.Item>

				{isEditing && (
					<Form.Item wrapperCol={{ offset: 6 }}>
						<Button type="primary" htmlType="submit">
							保存
						</Button>
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
});

export default InfoModal;
