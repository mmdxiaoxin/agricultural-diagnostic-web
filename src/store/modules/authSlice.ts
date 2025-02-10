import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	token: string | null;
	authRouter: string[];
	authButtons: {
		[propName: string]: any;
	};
}

const initialState: AuthState = {
	token: localStorage.getItem("auth_token") || null,
	authRouter: [],
	authButtons: []
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken: (state, action: PayloadAction<string>) => {
			state.token = action.payload;
			if (action.payload) {
				localStorage.setItem("auth_token", action.payload);
			}
		},
		removeToken(state) {
			state.token = null;
			localStorage.removeItem("auth_token");
		},
		setAuthRouter: (state, action: PayloadAction<string[]>) => {
			state.authRouter = action.payload;
		},
		setAuthButtons: (
			state,
			action: PayloadAction<{
				[propName: string]: any;
			}>
		) => {
			state.authButtons = action.payload;
		}
	}
});

// 导出 actions 和 reducer
export const { setToken, removeToken, setAuthRouter, setAuthButtons } = authSlice.actions;
export default authSlice.reducer;
