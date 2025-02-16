import { ResUserProfile } from "@/api/interface";
import { getRoleDict } from "@/api/modules/auth";
import { getAvatar, getUserProfile, updateUserProfile, uploadAvatar } from "@/api/modules/user";
import { ROLE_COLOR } from "@/constants";
import {
	HomeOutlined,
	LoadingOutlined,
	PhoneOutlined,
	PlusOutlined,
	UserOutlined
} from "@ant-design/icons";
import {
	Button,
	Form,
	GetProp,
	Input,
	message,
	Modal,
	Space,
	Tag,
	Upload,
	UploadProps
} from "antd";
import { RcFile } from "antd/es/upload";
import dayjs from "dayjs";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface InfoModalProps {
	onSave?: (values?: UserForm) => void;
}
export interface InfoModalRef {
	open: () => void;
}

type UserForm = ResUserProfile & { role: string };

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

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	useImperativeHandle(ref, () => ({
		open: handleOpen
	}));

	const fetchUser = () => {
		try {
			Promise.all([getUserProfile(), getRoleDict(), getAvatar()]).then(
				([userRes, roleRes, avatarBlob]) => {
					if (userRes.code !== 200 || !userRes.data) throw new Error(userRes.message);
					const user = userRes.data;
					const role = roleRes.data?.find(item => item.key === user.role_id);
					if (!role) throw new Error("未找到角色信息");

					form.setFieldsValue({
						...user,
						role: role.value
					});
					setImageUrl(URL.createObjectURL(avatarBlob));
					setOpen(true);
				}
			);
		} catch (error) {
			message.error("获取用户信息失败");
		}
	};

	const handleOpen = () => {
		fetchUser();
	};

	const handleOk = () => {
		form.submit();
		setOpen(false);
	};

	const handleCancel = () => {
		form.resetFields();
		setOpen(false);
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

			onSave?.(values);
			setIsEditing(false);
			message.success("修改用户信息成功 🎉🎉🎉");
		} catch (error: any) {
			message.error("更新用户信息失败: " + error.message);
		}
	};

	const handleChange: UploadProps["onChange"] = info => {
		if (info.file.status === "uploading") {
			setLoading(true);
			return;
		}
		if (info.file.status === "done") {
			getBase64(info.file.originFileObj as FileType, url => {
				setLoading(false);
				setImageUrl(url);
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
			onSave?.(form.getFieldsValue() as UserForm);
			message.success("上传头像成功 🎉🎉🎉");
		} catch (error: any) {
			onError?.(error);
			message.error("上传头像失败: " + error.message);
		}
	};

	const uploadButton = (
		<button style={{ border: 0, background: "none" }} type="button">
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>Upload</div>
		</button>
	);

	return (
		<Modal
			title="个人信息"
			open={open}
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
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				layout="horizontal"
				onFinish={handleSave}
			>
				<Form.Item label="头像">
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
							<img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
						) : (
							uploadButton
						)}
					</Upload>
				</Form.Item>

				<Form.Item label="用户名" name="username">
					<Space>
						<UserOutlined />
						{form.getFieldValue("username")}
					</Space>
				</Form.Item>

				<Form.Item label="角色" name="role">
					<Tag color={ROLE_COLOR[form.getFieldValue("role") as keyof typeof ROLE_COLOR]}>
						{form.getFieldValue("role")}
					</Tag>
				</Form.Item>

				<Form.Item label="姓名" name="name">
					<Input disabled={!isEditing} />
				</Form.Item>

				<Form.Item label="手机号" name="phone">
					<Input prefix={<PhoneOutlined />} disabled={!isEditing} />
				</Form.Item>

				<Form.Item label="住址" name="address">
					<Input prefix={<HomeOutlined />} disabled={!isEditing} />
				</Form.Item>

				<Form.Item label="创建时间" name="createdAt">
					<span>{dayjs(form.getFieldValue("createdAt")).format("YYYY-MM-DD HH:mm:ss")}</span>
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
