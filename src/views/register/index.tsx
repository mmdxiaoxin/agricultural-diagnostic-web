import { registerApi } from "@/api/modules/auth";
import { store } from "@/store";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row, Space } from "antd";
import clsx from "clsx";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router";

type FormData = {
	email: string;
	password: string;
	confirmPassword: string;
};

const Register: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const onFinish = async (values: FormData) => {
		setLoading(true);
		try {
			const { confirmPassword, ...params } = values;
			const res = await registerApi(params);
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
		<div
			className={clsx(
				"bg-gray-100 bg-cover bg-center min-h-screen",
				"bg-[url('@/assets/images/login_bg.svg')]"
			)}
		>
			<Row justify="center" align="middle" className="h-screen">
				<Col xs={20} sm={16} md={12} lg={8}>
					<div className="bg-white p-8 shadow-lg rounded-lg">
						<h2 className="text-center text-2xl font-bold mb-8">创建账号</h2>
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
								className="h-[70px] mb-0"
							>
								<Input
									prefix={<UserOutlined className="mr-2.5" />}
									placeholder="请输入邮箱"
									autoComplete="off"
									className="text-sm"
								/>
							</Form.Item>
							<Form.Item
								name="password"
								rules={[{ required: true, message: "请输入密码" }]}
								className="h-[70px] mb-0"
							>
								<Input.Password
									prefix={<LockOutlined className="mr-2.5" />}
									placeholder="请输入密码"
									autoComplete="new-password"
									className="text-sm"
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
								className="h-[70px] mb-0"
							>
								<Input.Password
									prefix={<LockOutlined className="mr-2.5" />}
									placeholder="请确认密码"
									autoComplete="new-password"
									className="text-sm"
								/>
							</Form.Item>
							<Form.Item>
								<Space direction="vertical" className="w-full">
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
