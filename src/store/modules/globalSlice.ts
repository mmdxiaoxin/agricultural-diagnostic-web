import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ThemeConfigProp {
	primary: string;
	isDark: boolean;
	weakOrGray: string;
	breadcrumb: boolean;
	tabs: boolean;
	footer: boolean;
}

// 定义菜单状态的类型
interface GlobalState {
	themeConfig: ThemeConfigProp;
}

const initialState: GlobalState = {
	themeConfig: {
		// 默认 primary 主题颜色
		primary: "#1890ff",
		// 深色模式
		isDark: false,
		// 色弱模式(weak) || 灰色模式(gray)
		weakOrGray: "",
		// 面包屑导航
		breadcrumb: true,
		// 标签页
		tabs: true,
		// 页脚
		footer: true
	}
};

const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		// 设置主题配置
		setThemeConfig(state, action: PayloadAction<ThemeConfigProp>) {
			state.themeConfig = action.payload;
		}
	}
});

// 导出 action 和 reducer
export const { setThemeConfig } = globalSlice.actions;
export default globalSlice.reducer;
