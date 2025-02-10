import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义菜单状态的类型
interface BreadcrumbState {
	breadcrumbList: {
		[propName: string]: any;
	};
}

const initialState: BreadcrumbState = {
	breadcrumbList: {}
};

const breadcrumbSlice = createSlice({
	name: "breadcrumb",
	initialState,
	reducers: {
		setBreadcrumbList(state, action: PayloadAction<any>) {
			state.breadcrumbList = action.payload;
		}
	}
});

// 导出 action 和 reducer
export const { setBreadcrumbList } = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
