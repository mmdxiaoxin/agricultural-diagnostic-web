import { useState, useImperativeHandle, Ref } from "react";
import { Modal, Input, message, Button, Form, InputNumber, DatePicker } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import moment from "moment";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void } | undefined>;
}

const InfoModal = (props: Props) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [userInfo, setUserInfo] = useState({
		username: "john_doe", // Example initial value
		role: "user", // Example initial value
		name: "John Doe", // Example initial value
		phone: "1234567890", // Example initial value
		address: "123 Main St", // Example initial value
		createdAt: moment().subtract(1, "year") // Example initial value
	});

	const [isEditing, setIsEditing] = useState(false); // Whether user is in editing mode

	useImperativeHandle(props.innerRef, () => ({
		showModal
	}));

	const showModal = (params: { name: number }) => {
		console.log(params);
		setModalVisible(true);
	};

	const handleOk = () => {
		setModalVisible(false);
		message.success("修改用户信息成功 🎉🎉🎉");
	};

	const handleCancel = () => {
		setModalVisible(false);
	};

	const handleEdit = () => {
		setIsEditing(true); // Enable editing mode
	};

	const handleSave = (values: any) => {
		setUserInfo({ ...userInfo, ...values });
		setIsEditing(false); // Disable editing mode
		message.success("信息已更新！");
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
				initialValues={userInfo}
			>
				<Form.Item label="用户名" name="username">
					<Input
						prefix={<UserOutlined />}
						disabled={!isEditing}
						value={userInfo.username}
						onChange={e => setUserInfo({ ...userInfo, username: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="角色" name="role">
					<Input
						disabled={!isEditing}
						value={userInfo.role}
						onChange={e => setUserInfo({ ...userInfo, role: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="姓名" name="name">
					<Input
						disabled={!isEditing}
						value={userInfo.name}
						onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="手机号" name="phone">
					<Input
						prefix={<PhoneOutlined />}
						disabled={!isEditing}
						value={userInfo.phone}
						onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="住址" name="address">
					<Input
						prefix={<HomeOutlined />}
						disabled={!isEditing}
						value={userInfo.address}
						onChange={e => setUserInfo({ ...userInfo, address: e.target.value })}
					/>
				</Form.Item>

				<Form.Item label="创建时间" name="createdAt">
					<DatePicker
						disabled={!isEditing}
						value={userInfo.createdAt}
						onChange={date => setUserInfo({ ...userInfo, createdAt: date })}
					/>
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
};

export default InfoModal;
