import { getAvatar, getUserProfile } from "@/api/modules/user";
import defaultAvatar from "@/assets/images/avatar.png";
import { HOME_URL } from "@/config/config";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { removeAuthButtons, removeAuthRouter, removeToken } from "@/store/modules/authSlice";
import { removeMenuList } from "@/store/modules/menuSlice";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styles from "../index.module.scss";
import InfoModal, { InfoModalRef } from "./InfoModal";
import PasswordModal, { PasswordModalRef } from "./PasswordModal";
import { User } from "@/api/interface";

const AvatarIcon = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const passRef = useRef<PasswordModalRef>(null);
	const infoRef = useRef<InfoModalRef>(null);

	const [userData, setUserData] = useState<User>();
	const [avatar, setAvatar] = useState<string>(defaultAvatar);

	const fetchUser = async () => {
		try {
			const res = await getUserProfile();
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setUserData(res.data);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const fetchAvatar = async () => {
		try {
			const res = await getAvatar();
			if (!res) throw new Error("获取头像失败！");
			const url = URL.createObjectURL(res);
			setAvatar(url);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	useEffect(() => {
		Promise.all([fetchUser(), fetchAvatar()]);
	}, []);

	// 退出登录
	const logout = () => {
		Modal.confirm({
			title: "温馨提示 🧡",
			icon: <ExclamationCircleOutlined />,
			content: "是否确认退出登录？",
			okText: "确认",
			cancelText: "取消",
			onOk: () => {
				dispatch(removeToken());
				dispatch(removeAuthButtons());
				dispatch(removeAuthRouter());
				dispatch(removeMenuList());
				message.success("退出登录成功！");
				navigate("/login");
			}
		});
	};

	const handleReset = () => {
		dispatch(removeToken());
		dispatch(removeAuthButtons());
		dispatch(removeAuthRouter());
		dispatch(removeMenuList());
		navigate("/login");
	};

	const handleSave = (_: any, avatar?: string | null) => {
		fetchUser();
		setAvatar(avatar || defaultAvatar);
	};

	// Dropdown Menu
	const items: MenuProps["items"] = [
		{
			key: "1",
			label: <span className={styles["dropdown-item"]}>首页</span>,
			onClick: () => navigate(HOME_URL)
		},
		{
			key: "2",
			label: <span className={styles["dropdown-item"]}>个人信息</span>,
			onClick: () => infoRef.current?.open(userData, avatar)
		},
		{
			key: "3",
			label: <span className={styles["dropdown-item"]}>修改密码</span>,
			onClick: () => passRef.current?.open()
		},
		{
			type: "divider"
		},
		{
			key: "4",
			label: <span className={styles["dropdown-item"]}>退出登录</span>,
			onClick: logout
		}
	];

	return (
		<>
			<span className={styles["username"]}>{userData?.username}</span>
			<Dropdown menu={{ items }} placement="bottom" arrow trigger={["click"]}>
				<Avatar className={styles["avatar"]} size="large" src={avatar} />
			</Dropdown>
			<InfoModal ref={infoRef} onSave={handleSave}></InfoModal>
			<PasswordModal ref={passRef} onReset={handleReset}></PasswordModal>
		</>
	);
};

export default AvatarIcon;
