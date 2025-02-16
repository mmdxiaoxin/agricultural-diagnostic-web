import { FILE_TYPE_COLOR, MIME_TYPE, MIMETypeValue } from "@/constants";
import { RouteObjectEx } from "@/routes/interface";

/**
 * @description 获取localStorage
 * @param {String} key Storage名称
 * @return string
 */
export const localGet = (key: string) => {
	const value = window.localStorage.getItem(key);
	try {
		return JSON.parse(window.localStorage.getItem(key) as string);
	} catch (error) {
		return value;
	}
};

/**
 * @description 存储localStorage
 * @param {String} key Storage名称
 * @param {Any} value Storage值
 * @return void
 */
export const localSet = (key: string, value: any) => {
	window.localStorage.setItem(key, JSON.stringify(value));
};

/**
 * @description 清除localStorage
 * @param {String} key Storage名称
 * @return void
 */
export const localRemove = (key: string) => {
	window.localStorage.removeItem(key);
};

/**
 * @description 清除所有localStorage
 * @return void
 */
export const localClear = () => {
	window.localStorage.clear();
};

/**
 * @description 获取浏览器默认语言
 * @return string
 */
export const getBrowserLang = () => {
	// @ts-ignore
	let browserLang = navigator.language ? navigator.language : navigator.browserLanguage;
	let defaultBrowserLang = "";
	if (
		browserLang.toLowerCase() === "cn" ||
		browserLang.toLowerCase() === "zh" ||
		browserLang.toLowerCase() === "zh-cn"
	) {
		defaultBrowserLang = "zh";
	} else {
		defaultBrowserLang = "en";
	}
	return defaultBrowserLang;
};

/**
 * @description 获取需要展开的 subMenu
 * @param {String} path 当前访问地址
 * @returns array
 */
export const getOpenKeys = (path: string) => {
	let newStr: string = "";
	let newArr: any[] = [];
	let arr = path.split("/").map(i => "/" + i);
	for (let i = 1; i < arr.length - 1; i++) {
		newStr += arr[i];
		newArr.push(newStr);
	}
	return newArr;
};

/**
 * @description 递归查询对应的路由
 * @param {String} path 当前访问地址
 * @param {Array} routes 路由列表
 * @returns array
 */
export const searchRoute = (path: string, routes: RouteObjectEx[] = []): RouteObjectEx => {
	let result: RouteObjectEx = {};
	for (let item of routes) {
		if (item.path === path) return item;
		if (item.children) {
			const res = searchRoute(path, item.children);
			if (Object.keys(res).length) result = res;
		}
	}
	return result;
};

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

/**
 * @description 使用递归处理路由菜单，生成一维数组，做菜单权限判断
 * @param {Array} menuList 所有菜单列表
 * @param {Array} newArr 菜单的一维数组
 * @return array
 */
export function handleRouter(routerList: Menu.MenuOptions[], newArr: string[] = []) {
	routerList.forEach((item: Menu.MenuOptions) => {
		typeof item === "object" && item.path && newArr.push(item.path);
		item.children && item.children.length && handleRouter(item.children, newArr);
	});
	return newArr;
}

/**
 * @description 判断数据类型
 * @param {Any} val 需要判断类型的数据
 * @return string
 */
export const isType = (val: any) => {
	if (val === null) return "null";
	if (typeof val !== "object") return typeof val;
	else return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase();
};

/**
 * @description 对象数组深克隆
 * @param {Object} obj 源对象
 * @return object
 */
export const deepCopy = <T>(obj: any): T => {
	let newObj: any;
	try {
		newObj = obj.push ? [] : {};
	} catch (error) {
		newObj = {};
	}
	for (let attr in obj) {
		if (typeof obj[attr] === "object") {
			newObj[attr] = deepCopy(obj[attr]);
		} else {
			newObj[attr] = obj[attr];
		}
	}
	return newObj;
};

/**
 * @description 生成随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @return number
 */
export function randomNum(min: number, max: number): number {
	let num = Math.floor(Math.random() * (min - max) + max);
	return num;
}

/**
 * @description 用于换算单位的函数
 * @param {Number} sizeInBytes 文件大小（字节）
 * @return string
 */
export const formatSize = (sizeInBytes: number) => {
	if (sizeInBytes >= 1_000_000_000) {
		return (sizeInBytes / 1_000_000_000).toFixed(2) + " GB"; // GB
	} else if (sizeInBytes >= 1_000_000) {
		return (sizeInBytes / 1_000_000).toFixed(2) + " MB"; // MB
	} else if (sizeInBytes >= 1_000) {
		return (sizeInBytes / 1_000).toFixed(2) + " KB"; // KB
	} else {
		return sizeInBytes + " B"; // B
	}
};

/**
 * @description 获取二级文件类型
 * @param {String} type 一级文件类型
 * @return array
 */
export const getFileType = (type: string): MIMETypeValue[] => {
	switch (type) {
		case "image":
			return Object.values(MIME_TYPE.Image);
		case "video":
			return [...Object.values(MIME_TYPE.Video)];
		case "application":
			return [...Object.values(MIME_TYPE.Application)];
		case "audio":
			return [...Object.values(MIME_TYPE.Audio)];
		case "app":
			return [...Object.values(MIME_TYPE.App)];
		case "other":
			return [...Object.values(MIME_TYPE.Other), ...Object.values(MIME_TYPE.Font)];
		default:
			return [];
	}
};

/**
 * @description 获取文件类型对应颜色
 * @param {String} mimeType 文件类型
 * @return string
 */
export function getFileTypeColor(mimeType: MIMETypeValue): string {
	// 检查文件类型并返回对应颜色
	if (Object.values(MIME_TYPE.Video).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Video;
	} else if (Object.values(MIME_TYPE.Audio).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Audio;
	} else if (Object.values(MIME_TYPE.Image).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Image;
	} else if (Object.values(MIME_TYPE.Application).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Application;
	} else if (Object.values(MIME_TYPE.App).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Application;
	} else if (Object.values(MIME_TYPE.Font).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.Application;
	} else if (Object.values(MIME_TYPE.Other).includes(mimeType as any)) {
		return FILE_TYPE_COLOR.other;
	} else {
		return FILE_TYPE_COLOR.other;
	}
}

type RequestFn<T> = () => Promise<T>;

interface ConcurrencyQueueOptions {
	concurrency: number; // 最大并发数
	onProgress?: (completed: number, total: number) => void; // 可选的进度回调
}

/**
 * @description 并发队列
 * @param {Array} tasks 请求任务列表
 * @param {Object} options 配置项
 * @return Promise
 */
export const concurrencyQueue = async <T>(
	tasks: RequestFn<T>[],
	{ concurrency, onProgress }: ConcurrencyQueueOptions
): Promise<T[]> => {
	const results: T[] = [];
	let currentIndex = 0; // 当前请求的索引
	let completed = 0; // 已完成的请求数

	// 控制并发请求的队列
	const executeTask = async () => {
		while (currentIndex < tasks.length) {
			const taskIndex = currentIndex++;
			const task = tasks[taskIndex];

			try {
				// 执行请求
				const result = await task();
				results[taskIndex] = result;
			} catch (error) {
				// 处理错误（你可以根据需求调整错误处理方式）
				console.error(`任务 ${taskIndex} 执行失败`, error);
			}

			completed++;

			// 调用进度回调
			if (onProgress) {
				onProgress(completed, tasks.length);
			}
		}
	};

	// 执行并发请求队列，限制并发数
	const promises: Promise<void>[] = [];
	for (let i = 0; i < concurrency; i++) {
		promises.push(executeTask());
	}

	// 等待所有任务完成
	await Promise.all(promises);

	return results;
};

/**
 * @description 获取模型文件 MIME 类型
 * @param {String} extension 文件扩展名
 * @return string
 */
export const getModelMimeType = (extension: string): string => {
	const modelMimeTypes: { [key: string]: string } = {
		pth: "application/pytorch-model",
		pt: "application/pytorch-model",
		h5: "application/tensorflow-model",
		pb: "application/tensorflow-model",
		onnx: "application/onnx-model",
		caffemodel: "application/caffe-model",
		weights: "application/darknet-weights",
		params: "application/mxnet-model",
		bin: "application/huggingface-model"
	};

	return modelMimeTypes[extension.toLowerCase()] || "application/octet-stream";
};
