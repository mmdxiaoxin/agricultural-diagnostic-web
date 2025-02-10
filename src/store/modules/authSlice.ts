import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	token: string | null;
	authRouter: string[];
}

const initialState: AuthState = {
	token: null,
	authRouter: [] // 这里存储动态路由
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken: (state, action: PayloadAction<string | null>) => {
			state.token = action.payload;
		},
		setAuthRouter: (state, action: PayloadAction<string[]>) => {
			state.authRouter = action.payload;
		}
	}
});

// 导出 actions 和 reducer
export const { setToken, setAuthRouter } = authSlice.actions;
export default authSlice.reducer;
