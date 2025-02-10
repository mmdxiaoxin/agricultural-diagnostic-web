import { loginApi } from "@/api/modules/auth";
import loginLeft from "@/assets/images/login.svg";
import logo from "@/assets/images/logo.svg";
import { setToken } from "@/store/modules/authSlice";
import { CloseCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, message, Row } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import "./index.scss";

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const [form] = Form.useForm();

	const [loading, setLoading] = useState<boolean>(false);

	// 登录
	const onFinish = async () => {
		try {
			setLoading(true);
			const response = await loginApi({
				username: form.getFieldValue("username"),
				password: form.getFieldValue("password")
			});
			if (response.code === 200 && response.data) {
				dispatch(setToken(response.data.token));
				navigate("/home/index");
			} else {
				message.error(response.msg);
			}
		} catch (error) {
			message.error("登录失败" + error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<Row gutter={16} className="login-box">
				{/* 左侧图片部分 */}
				<Col xs={0} sm={0} md={12} lg={12} xl={14} className="login-left">
					<img src={loginLeft} alt="login" />
				</Col>

				{/* 右侧登录表单 */}
				<Col xs={24} sm={24} md={12} lg={12} xl={10} className="login-form-container">
					<div className="login-form">
						<div className="login-logo">
							<img className="login-icon" src={logo} alt="logo" />
							<span className="logo-text">病虫害智能诊断系统</span>
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
							<Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
								<Input placeholder="用户名：admin / user" prefix={<UserOutlined />} />
							</Form.Item>
							<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
								<Input.Password
									autoComplete="new-password"
									placeholder="密码：123456"
									prefix={<LockOutlined />}
								/>
							</Form.Item>
							<Form.Item className="login-btn">
								<Flex justify={"space-between"} align={"center"}>
									<Button
										onClick={() => {
											form.resetFields();
										}}
										icon={<CloseCircleOutlined />}
									>
										重置
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										loading={loading}
										icon={<UserOutlined />}
									>
										确认
									</Button>
								</Flex>
							</Form.Item>
						</Form>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default Login;
