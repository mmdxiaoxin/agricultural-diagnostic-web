import { MenuItem } from "@/api/interface";
import { getMenuList } from "@/api/modules/menu";
import { configureMenuRoles } from "@/api/modules/menu";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Modal, Tree, message } from "antd";
import type { DataNode } from "antd/es/tree";

export interface MenuConfigModalRef {
	open: (roleId: number) => void;
}

interface MenuConfigModalProps {
	onSuccess?: () => void;
}

const MenuConfigModal = forwardRef<MenuConfigModalRef, MenuConfigModalProps>(
	({ onSuccess }, ref) => {
		const [visible, setVisible] = useState(false);
		const [loading, setLoading] = useState(false);
		const [menuTree, setMenuTree] = useState<DataNode[]>([]);
		const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
		const currentRoleId = useRef<number>();

		useImperativeHandle(ref, () => ({
			open: async (roleId: number) => {
				currentRoleId.current = roleId;
				setVisible(true);
				await fetchMenuTree();
			}
		}));

		const fetchMenuTree = async () => {
			try {
				const response = await getMenuList();
				if (response.code !== 200) throw new Error(response.message);

				const treeData = formatMenuTree(response.data || []);
				setMenuTree(treeData);
			} catch (error: any) {
				message.error(error.message);
			}
		};

		const formatMenuTree = (menus: MenuItem[]): DataNode[] => {
			const menuMap = new Map<number, DataNode>();
			const result: DataNode[] = [];

			// 首先创建所有菜单节点
			menus.forEach(menu => {
				menuMap.set(menu.id, {
					key: menu.id,
					title: menu.title,
					children: []
				});
			});

			// 构建树形结构
			menus.forEach(menu => {
				const node = menuMap.get(menu.id)!;
				if (!menu.parentId) {
					result.push(node);
				} else {
					const parent = menuMap.get(menu.parentId);
					if (parent) {
						parent.children!.push(node);
					}
				}
			});

			return result;
		};

		const handleOk = async () => {
			if (!currentRoleId.current) return;

			setLoading(true);
			try {
				const response = await configureMenuRoles({
					menuId: currentRoleId.current,
					roleIds: selectedKeys
				});

				if (response.code !== 200) throw new Error(response.message);

				message.success("配置菜单成功");
				setVisible(false);
				onSuccess?.();
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		return (
			<Modal
				title="配置菜单"
				open={visible}
				onOk={handleOk}
				onCancel={() => setVisible(false)}
				confirmLoading={loading}
				width={600}
			>
				<Tree
					checkable
					checkedKeys={selectedKeys}
					onCheck={checkedKeys => setSelectedKeys(checkedKeys as number[])}
					treeData={menuTree}
					height={400}
					className="overflow-auto"
				/>
			</Modal>
		);
	}
);

export default MenuConfigModal;
