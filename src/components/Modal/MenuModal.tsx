import { MenuItem } from "@/api/interface";
import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface MenuModalRef {
	open: (menu?: MenuItem) => void;
	close: () => void;
}

interface MenuModalProps {
	onSave: (values: any) => void;
	menuList: MenuItem[];
}

const MenuModal = forwardRef<MenuModalRef, MenuModalProps>(({ onSave, menuList }, ref) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

	useImperativeHandle(ref, () => ({
		open: (menu?: MenuItem) => {
			if (menu) {
				setEditingMenu(menu);
				form.setFieldsValue(menu);
			} else {
				setEditingMenu(null);
				form.resetFields();
			}
			setModalVisible(true);
		},
		close: () => {
			setModalVisible(false);
			setEditingMenu(null);
			form.resetFields();
		}
	}));

	const handleModalOk = async () => {
		try {
			const values = await form.validateFields();
			onSave(values);
			setModalVisible(false);
		} catch (error: any) {
			// 表单验证失败
		}
	};

	const handleModalCancel = () => {
		setModalVisible(false);
		setEditingMenu(null);
		form.resetFields();
	};

	// 过滤掉当前编辑的菜单及其子菜单，避免循环引用
	const filterMenuOptions = (menu: MenuItem): boolean => {
		if (!editingMenu) return true;
		if (menu.id === editingMenu.id) return false;
		if (menu.children) {
			menu.children = menu.children.filter(filterMenuOptions);
		}
		return true;
	};

	const menuOptions = menuList.filter(filterMenuOptions).map(menu => ({
		label: menu.title,
		value: menu.id
	}));

	return (
		<Modal
			title={editingMenu ? "编辑菜单" : "添加菜单"}
			open={modalVisible}
			onOk={handleModalOk}
			onCancel={handleModalCancel}
			destroyOnClose
			width={600}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					name="title"
					label="菜单名称"
					rules={[{ required: true, message: "请输入菜单名称" }]}
				>
					<Input placeholder="请输入菜单名称" />
				</Form.Item>
				<Form.Item
					name="icon"
					label="菜单图标"
					rules={[{ required: true, message: "请输入菜单图标" }]}
				>
					<Input placeholder="请输入菜单图标" />
				</Form.Item>
				<Form.Item
					name="path"
					label="路由路径"
					rules={[{ required: true, message: "请输入路由路径" }]}
				>
					<Input placeholder="请输入路由路径" />
				</Form.Item>
				<Form.Item name="parentId" label="上级菜单">
					<Select
						placeholder="请选择上级菜单"
						allowClear
						options={[{ label: "无", value: 0 }, ...menuOptions]}
					/>
				</Form.Item>
				<Form.Item name="sort" label="排序" rules={[{ required: true, message: "请输入排序" }]}>
					<InputNumber min={0} placeholder="请输入排序" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item name="isLink" label="是否外链" valuePropName="checked">
					<Switch />
				</Form.Item>
			</Form>
		</Modal>
	);
});

MenuModal.displayName = "MenuModal";

export default MenuModal;
