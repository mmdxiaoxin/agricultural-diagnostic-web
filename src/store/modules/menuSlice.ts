import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义菜单状态的类型
interface MenuState {
	menuList: Menu.MenuOptions[];
	isCollapse: boolean;
}

const initialState: MenuState = {
	menuList: [],
	isCollapse: false
};

const menuSlice = createSlice({
	name: "menu",
	initialState,
	reducers: {
		setMenuList(state, action: PayloadAction<any[]>) {
			state.menuList = action.payload;
		},
		setCollapse(state, action: PayloadAction<boolean>) {
			state.isCollapse = action.payload;
		}
	}
});

// 导出 action 和 reducer
export const { setMenuList, setCollapse } = menuSlice.actions;
export default menuSlice.reducer;
