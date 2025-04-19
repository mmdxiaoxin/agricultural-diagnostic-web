import { loginApi } from "@/api/modules/auth";
import loginLeft from "@/assets/images/login.svg";
import logo from "@/assets/images/logo.svg";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { store } from "@/store";
import { setToken } from "@/store/modules/authSlice";
import {
	CloseCircleOutlined,
	LockOutlined,
	SyncOutlined,
	UserAddOutlined,
	UserOutlined
} from "@ant-design/icons";
import { Button, Col, Flex, FloatButton, Form, Input, message, Row } from "antd";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import clsx from "clsx";

interface FormData {
	login: string;
	password: string;
}

const Login: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);

	// 登录
	const onFinish = async ({ login, password }: FormData) => {
		try {
			setLoading(true);
			const response = await loginApi({
				login,
				password
			});
			if (response.code === 200 && response.data) {
				dispatch(setToken(response.data.access_token));
				navigate("/home/index");
			} else {
				message.error(response.message);
			}
		} catch (error) {
			// message.error("登录失败" + error.);
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = () => {
		navigate("/register");
	};

	const handleForgotPassword = () => {
		message.info("请联系管理员重置密码");
	};

	const token = store.getState().auth.token;

	if (token) {
		return <Navigate to="/home/index" />;
	}

	return (
		<div
			className={clsx(
				"relative flex h-screen bg-cover bg-center bg-no-repeat",
				"bg-[url('@/assets/images/login_bg.svg')]"
			)}
		>
			<Row className="flex flex-1 rounded-lg items-center justify-center">
				{/* 左侧图片部分 */}
				<Col xs={0} sm={0} md={12} lg={12} xl={14} className="flex-1">
					<img src={loginLeft} alt="login" className="object-cover object-center w-full h-full" />
				</Col>

				{/* 右侧登录表单 */}
				<Col xs={24} sm={24} md={12} lg={12} xl={10}>
					<div
						className={clsx(
							"p-6 mx-6 rounded-lg bg-white shadow-lg",
							"md:py-10 md:px-10 md:mr-6",
							"lg:py-10 lg:px-10 lg:mr-10",
							"xl:py-12 xl:px-12 xl:mr-12",
							"2xl:py-12 2xl:px-12 2xl:mr-12"
						)}
					>
						<div className="flex items-center justify-center mb-10">
							<img
								className={clsx(
									"w-auto h-10 object-contain",
									"md:h-12",
									"lg:h-14",
									"xl:h-16",
									"2xl:h-16"
								)}
								src={logo}
								alt="logo"
							/>
							<span
								className={clsx(
									"font-bold whitespace-nowrap pl-6 text-2xl",
									"md:text-3xl",
									"lg:text-4xl",
									"xl:text-5xl",
									"2xl:text-5xl"
								)}
							>
								病害智能诊断系统
							</span>
						</div>
						<Form
							form={form}
							name="basic"
							labelCol={{ span: 5 }}
							initialValues={{ remember: true }}
							onFinish={onFinish}
							size="large"
							autoComplete="off"
						>
							<Form.Item
								name="login"
								rules={[
									{ required: true, message: "请输入用户名或邮箱" },
									{
										validator(_, value) {
											if (
												!value ||
												/^[\w-]{4,16}$/.test(value) ||
												/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
													value
												)
											) {
												return Promise.resolve();
											}
											return Promise.reject(new Error("请输入有效的用户名或邮箱"));
										}
									}
								]}
							>
								<Input placeholder="用户名或邮箱" prefix={<UserOutlined />} />
							</Form.Item>
							<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
								<Input.Password
									autoComplete="new-password"
									placeholder="请输入密码"
									prefix={<LockOutlined />}
								/>
							</Form.Item>

							<Form.Item className="w-full mt-2.5 whitespace-nowrap">
								<Flex justify={"space-between"} align={"center"}>
									<Button
										onClick={() => {
											form.resetFields();
										}}
										icon={<CloseCircleOutlined />}
										className="text-sm w-[120px] md:w-[140px] lg:w-[180px]"
									>
										重置
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										loading={loading}
										icon={<UserOutlined />}
										className="text-sm w-[120px] md:w-[140px] lg:w-[180px]"
									>
										登录
									</Button>
								</Flex>
							</Form.Item>
							<FloatButton.Group trigger="click" type="primary" style={{ insetInlineEnd: 70 }}>
								<FloatButton
									icon={<UserAddOutlined />}
									tooltip={"账号注册"}
									onClick={handleRegister}
								/>
								<FloatButton
									icon={<SyncOutlined />}
									tooltip={"忘记密码"}
									onClick={handleForgotPassword}
								/>
							</FloatButton.Group>
						</Form>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default Login;
