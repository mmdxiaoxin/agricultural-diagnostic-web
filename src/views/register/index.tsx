import { registerApi } from "@/api/modules/auth";
import { store } from "@/store";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row, Space } from "antd";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import "./index.scss";

type RegisterProps = {};

const Register: React.FC<RegisterProps> = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const onFinish = async (values: any) => {
		setLoading(true);
		try {
			const res = await registerApi(values);
			if (res.code !== 201) throw new Error("注册失败，请重试！");

			message.success("注册成功，请检查注册邮件进行验证！");
			navigate("/login");
		} catch (error) {
			message.error("注册失败，请重试！");
		} finally {
			setLoading(false);
		}
	};

	const token = store.getState().auth.token;

	if (token) {
		return <Navigate to="/home/index" />;
	}

	return (
		<div className="register-container">
			<Row justify="center" align="middle" style={{ height: "100vh" }}>
				<Col xs={20} sm={16} md={12} lg={8}>
					<div className="register-form-container">
						<h2 className="register-title">创建账号</h2>
						<Form
							name="register"
							labelCol={{ span: 5 }}
							initialValues={{ remember: true }}
							onFinish={onFinish}
							size="large"
						>
							<Form.Item
								name="email"
								rules={[
									{ required: true, message: "邮箱不能为空" },
									{ type: "email", message: "请输入有效的邮箱" }
								]}
							>
								<Input prefix={<UserOutlined />} placeholder="请输入邮箱" autoComplete="off" />
							</Form.Item>
							<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
								<Input.Password
									prefix={<LockOutlined />}
									placeholder="请输入密码"
									autoComplete="new-password"
								/>
							</Form.Item>
							<Form.Item
								name="confirmPassword"
								rules={[
									{ required: true, message: "请确认密码" },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue("password") === value) {
												return Promise.resolve();
											}
											return Promise.reject(new Error("密码和确认密码不一致！"));
										}
									})
								]}
							>
								<Input.Password
									prefix={<LockOutlined />}
									placeholder="请确认密码"
									autoComplete="new-password"
								/>
							</Form.Item>
							<Form.Item>
								<Space direction="vertical" style={{ width: "100%" }}>
									<Button type="primary" htmlType="submit" block loading={loading}>
										注册
									</Button>
									<Button type="link" block onClick={() => (window.location.href = "/login")}>
										已有账号？立即登录
									</Button>
								</Space>
							</Form.Item>
						</Form>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default Register;
