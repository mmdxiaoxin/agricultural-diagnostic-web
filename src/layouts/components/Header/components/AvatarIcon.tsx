import { getUserProfile } from "@/api/modules/user";
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

const AvatarIcon = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const passRef = useRef<PasswordModalRef>(null);
	const infoRef = useRef<InfoModalRef>(null);

	const [username, setUsername] = useState("未知用户");
	const [avatar, setAvatar] = useState<string>(defaultAvatar);

	const fetchUser = async () => {
		try {
			const res = await getUserProfile();
			if (res.code !== 200 || !res.data) {
				throw new Error(res.message);
			}
			setUsername(res.data.username || "");
			setAvatar(res.data.avatar || defaultAvatar);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	useEffect(() => {
		fetchUser();
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

	const handleSave = () => {
		fetchUser();
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
			onClick: () => infoRef.current?.open()
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
			<span className={styles["username"]}>{username}</span>
			<Dropdown menu={{ items }} placement="bottom" arrow trigger={["click"]}>
				<Avatar className={styles["avatar"]} size="large" src={avatar} />
			</Dropdown>
			<InfoModal ref={infoRef} onSave={handleSave}></InfoModal>
			<PasswordModal ref={passRef} onReset={handleReset}></PasswordModal>
		</>
	);
};

export default AvatarIcon;
