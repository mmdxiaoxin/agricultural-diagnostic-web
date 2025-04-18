import { User, UserAccount } from "@/api/interface";
import { updateUserProfile, uploadAvatar } from "@/api/modules/user";
import { ROLE_COLOR } from "@/constants";
import { HomeOutlined, LoadingOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Avatar,
	Button,
	Col,
	Form,
	GetProp,
	Input,
	message,
	Modal,
	Row,
	Select,
	Tag,
	Upload,
	UploadProps
} from "antd";
import { RcFile } from "antd/es/upload";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoModalProps {
	onSave?: (userData?: User, avatar?: string | null) => void;
}

export interface InfoModalRef {
	open: (userData?: User, avatar?: string) => void;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
	const reader = new FileReader();
	reader.addEventListener("load", () => callback(reader.result as string));
	reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
	const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
	if (!isJpgOrPng) {
		message.error("禁止上传非图片格式文件!");
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error("上传头像必须小于2MB!");
	}
	return isJpgOrPng && isLt2M;
};

const InfoModal = forwardRef<InfoModalRef, InfoModalProps>(({ onSave }, ref) => {
	const [form] = Form.useForm();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [userAccount, setUserData] = useState<UserAccount>();

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	const handleOpen = (userData?: User, avatar?: string) => {
		form.setFieldsValue(userData?.profile);
		setUserData(userData);
		setImageUrl(avatar || null);
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		form.resetFields();
		setIsModalVisible(false);
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async (values: any) => {
		try {
			const res = await updateUserProfile(values);
			if (res.code !== 200) throw new Error(res.message);

			onSave?.(values, imageUrl);
			setIsEditing(false);
			message.success("修改用户信息成功 🎉🎉🎉");
		} catch (error: any) {
			message.error("更新用户信息失败: " + error.message);
		}
	};

	const handleChange: UploadProps["onChange"] = info => {
		if (info.file.status === "uploading") {
			setUploadLoading(true);
			return;
		}
		if (info.file.status === "done") {
			getBase64(info.file.originFileObj as FileType, url => {
				setUploadLoading(false);
				setImageUrl(url);
				onSave?.(form.getFieldsValue(), url);
			});
		}
	};

	const customRequest = async (options: any) => {
		const { onSuccess, onError, file: rcFile } = options;
		const file = rcFile as RcFile | null;
		if (!file) {
			message.error("文件不能为空");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await uploadAvatar(formData);
			if (res.code !== 200) throw new Error(res.message);

			onSuccess?.(null, file);
			message.success("头像上传成功 🎉🎉🎉");
		} catch (error: any) {
			onError?.(error);
			message.error("头像上传失败: " + error.message);
		}
	};

	const UploadButton: React.FC = () => (
		<button style={{ border: 0, background: "none" }} type="button">
			{uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>上传</div>
		</button>
	);

	return (
		<Modal
			title="个人信息"
			open={isModalVisible}
			onCancel={handleCancel}
			destroyOnClose={true}
			footer={
				isEditing ? (
					<>
						<Button type="primary" onClick={() => form.submit()}>
							保存信息
						</Button>
						<Button onClick={() => setIsEditing(false)}>取消编辑</Button>
					</>
				) : (
					<Button type="primary" onClick={handleEdit}>
						编辑
					</Button>
				)
			}
		>
			<Row justify={"center"} className="mb-4">
				<Upload
					name="avatar"
					listType="picture-circle"
					className="avatar-uploader"
					showUploadList={false}
					customRequest={customRequest}
					beforeUpload={beforeUpload}
					onChange={handleChange}
				>
					{imageUrl ? (
						<Avatar
							src={imageUrl}
							alt="avatar"
							style={{
								width: "100px",
								height: "100px"
							}}
						/>
					) : (
						<UploadButton />
					)}
				</Upload>
			</Row>
			<Row>
				<Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
					<Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
						<Form.Item label="用户名">{userAccount?.username}</Form.Item>
						<Form.Item label="邮箱">{userAccount?.email}</Form.Item>
						<Form.Item label="角色">
							{userAccount?.roles?.map(role => (
								<Tag
									color={
										role.alias && ROLE_COLOR[role.alias as keyof typeof ROLE_COLOR]
											? ROLE_COLOR[role.alias as keyof typeof ROLE_COLOR]
											: "default"
									}
									key={role.id}
								>
									{role.alias}
								</Tag>
							))}
						</Form.Item>
						<Form.Item label="创建时间">
							{dayjs(userAccount?.createdAt).format("YYYY-MM-DD HH:mm:ss")}
						</Form.Item>
					</Form>
				</Col>
				<Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
					<Form
						form={form}
						disabled={!isEditing}
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 18 }}
						layout="horizontal"
						onFinish={handleSave}
					>
						<Form.Item label="性别" name="gender">
							<Select>
								<Select.Option value={0}>隐藏</Select.Option>
								<Select.Option value={1}>男</Select.Option>
								<Select.Option value={2}>女</Select.Option>
							</Select>
						</Form.Item>

						<Form.Item label="姓名" name="name">
							<Input />
						</Form.Item>

						<Form.Item label="手机号" name="phone">
							<Input prefix={<PhoneOutlined />} />
						</Form.Item>

						<Form.Item label="住址" name="address">
							<Input prefix={<HomeOutlined />} />
						</Form.Item>
					</Form>
				</Col>
			</Row>
		</Modal>
	);
});

export default InfoModal;
