import avatar from "@/assets/images/avatar.png";
import { HOME_URL } from "@/config/config";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { removeAuthButtons, removeAuthRouter, removeToken } from "@/store/modules/authSlice";
import { removeMenuList } from "@/store/modules/menuSlice";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import InfoModal from "./InfoModal";
import PasswordModal from "./PasswordModal";
import { getUserProfile } from "@/api/modules/user";

interface ModalProps {
	showModal: () => void;
}

const AvatarIcon = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const passRef = useRef<ModalProps>(null);
	const infoRef = useRef<ModalProps>(null);

	const [username, setUsername] = useState("未知用户");

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await getUserProfile();
				if (res.code !== 200 || !res.data) {
					throw new Error(res.message);
				}
				setUsername(res.data.username);
			} catch (error: any) {
				message.error(error.message);
			}
		};
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

	// Dropdown Menu
	const items: MenuProps["items"] = [
		{
			key: "1",
			label: <span className="dropdown-item">首页</span>,
			onClick: () => navigate(HOME_URL)
		},
		{
			key: "2",
			label: <span className="dropdown-item">个人信息</span>,
			onClick: () => infoRef.current!.showModal()
		},
		{
			key: "3",
			label: <span className="dropdown-item">修改密码</span>,
			onClick: () => passRef.current!.showModal()
		},
		{
			type: "divider"
		},
		{
			key: "4",
			label: <span className="dropdown-item">退出登录</span>,
			onClick: logout
		}
	];

	return (
		<>
			<span className="username">{username}</span>
			<Dropdown menu={{ items }} placement="bottom" arrow trigger={["click"]}>
				<Avatar size="large" src={avatar} />
			</Dropdown>
			<InfoModal innerRef={infoRef}></InfoModal>
			<PasswordModal innerRef={passRef}></PasswordModal>
		</>
	);
};

export default AvatarIcon;
