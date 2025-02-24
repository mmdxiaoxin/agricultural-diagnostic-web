import { RouteObjectEx } from "@/routes/interface";

/**
 * @description 递归查询对应的路由，支持参数化路由匹配
 * @param {String} path 当前访问地址
 * @param {Array} routes 路由列表
 * @returns RouteObjectEx
 */
export const searchRoute = (path: string, routes: RouteObjectEx[] = []): RouteObjectEx => {
	let result: RouteObjectEx = {};

	for (let item of routes) {
		// 构造正则表达式，替换路由中的动态部分（例如：:id）
		const routeRegex = new RegExp(`^${item.path?.replace(/:[^\s/]+/g, "([\\w-]+)")}$`);

		// 匹配路径
		const match = path.match(routeRegex);
		if (match) {
			// 提取动态参数并存入 params 对象
			const paramNames = (item.path?.match(/:([^\s/]+)/g) || []).map(param => param.substring(1));
			const params: Record<string, string> = {};
			paramNames.forEach((param, index) => {
				params[param] = match[index + 1]; // match[0] 是整个路径，之后的元素是参数值
			});

			// 将动态参数与路由数据合并
			result = { ...item, params };
			break; // 找到匹配的路由后停止遍历
		}

		// 递归查找子路由
		if (item.children) {
			const res = searchRoute(path, item.children);
			if (Object.keys(res).length) {
				result = res;
				break;
			}
		}
	}

	return result;
};
