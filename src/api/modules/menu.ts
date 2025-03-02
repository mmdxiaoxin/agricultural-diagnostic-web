import http from "@/api";

// * 获取菜单列表
export const getMenuList = () => http.get<Menu.MenuOptions[]>(`/menu/routes`);
