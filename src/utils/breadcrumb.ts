/**
 * @description 递归当前路由的 所有 关联的路由，生成面包屑导航栏
 * @param {String} path 当前访问地址
 * @param {Array} menuList 菜单列表
 * @returns array
 */
export const getBreadcrumbList = (
	path: string,
	menuList: Menu.MenuOptions[]
): { title: string; icon: string }[] => {
	const breadcrumb: { title: string; icon: string }[] = [];

	// 查找路径对应的菜单项，并构建面包屑
	const findMenuItem = (menu: Menu.MenuOptions[], path: string): Menu.MenuOptions | undefined => {
		for (const item of menu) {
			if (item.path === path) {
				return item;
			}
			if (item.children) {
				const found = findMenuItem(item.children, path);
				if (found) return found;
			}
		}
	};

	const menuItem = findMenuItem(menuList, path);
	if (menuItem) {
		// 构建面包屑（假设返回父菜单项的标题和图标）
		breadcrumb.push({
			title: menuItem.title,
			icon: menuItem.icon || "" // 如果没有 icon 则为空字符串
		});
	}

	return breadcrumb;
};

/**
 * @description 双重递归 找出所有 面包屑 生成对象存到 redux 中，就不用每次都去递归查找了
 * @param {String} menuList 当前菜单列表
 * @returns object
 */
export const findAllBreadcrumb = (
	menuList: Menu.MenuOptions[]
): { [path: string]: { title: string; icon: string }[] } => {
	let handleBreadcrumbList: { [path: string]: { title: string; icon: string }[] } = {};

	const loop = (menuItem: Menu.MenuOptions) => {
		// 如果有子菜单，则递归遍历子菜单
		if (menuItem?.children?.length) {
			menuItem.children.forEach(item => loop(item));
		} else {
			// 调用 getBreadcrumbList 返回包含 title 和 icon 的数组
			handleBreadcrumbList[menuItem.path] = getBreadcrumbList(menuItem.path, menuList);
		}
	};

	// 遍历菜单列表，执行递归
	menuList.forEach(item => loop(item));
	return handleBreadcrumbList;
};
