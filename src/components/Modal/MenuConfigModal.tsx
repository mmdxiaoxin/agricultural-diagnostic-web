import { MenuItem } from "@/api/interface";
import { configureMenuRoles, getMenuList, getRoleMenuById } from "@/api/modules/menu";
import { Modal, Tree, message } from "antd";
import type { DataNode } from "antd/es/tree";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

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
				try {
					// 并行获取菜单树和角色已有菜单
					const [_, roleMenusResponse] = await Promise.all([
						fetchMenuTree(),
						getRoleMenuById(roleId)
					]);

					if (roleMenusResponse.code === 200) {
						setSelectedKeys(roleMenusResponse.data || []);
					}
				} catch (error: any) {
					message.error(error.message);
				}
			}
		}));

		const fetchMenuTree = async () => {
			try {
				const response = await getMenuList();
				if (response.code !== 200) throw new Error(response.message);

				const treeData = formatMenuTree(response.data || []);
				setMenuTree(treeData);
				return response;
			} catch (error: any) {
				message.error(error.message);
				throw error;
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
				// 获取所有选中的节点（包括父节点）
				const allSelectedKeys = new Set<number>();

				// 递归处理节点，确保包含所有父节点
				const processNode = (node: DataNode, parentKey?: number) => {
					if (selectedKeys.includes(node.key as number)) {
						allSelectedKeys.add(node.key as number);
						// 如果当前节点被选中，添加其父节点
						if (parentKey) {
							allSelectedKeys.add(parentKey);
						}
						// 递归处理子节点
						node.children?.forEach(child => processNode(child, node.key as number));
					} else {
						// 即使当前节点未被选中，也要检查其子节点
						node.children?.forEach(child => processNode(child, node.key as number));
					}
				};

				// 处理所有根节点
				menuTree.forEach(node => processNode(node));

				const response = await configureMenuRoles({
					roleId: currentRoleId.current,
					menuIds: Array.from(allSelectedKeys)
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
					checkedKeys={selectedKeys || []}
					onCheck={checkedKeys => {
						if (Array.isArray(checkedKeys)) {
							setSelectedKeys(checkedKeys as number[]);
						} else {
							setSelectedKeys([]);
						}
					}}
					treeData={menuTree}
					height={400}
					className="overflow-auto"
				/>
			</Modal>
		);
	}
);

export default MenuConfigModal;
