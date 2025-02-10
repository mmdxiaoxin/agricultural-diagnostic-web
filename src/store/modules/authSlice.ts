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
	authRouter: JSON.parse(localStorage.getItem("auth_router") || "[]"),
	authButtons: JSON.parse(localStorage.getItem("auth_buttons") || "{}")
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken: (state, action: PayloadAction<string>) => {
			state.token = action.payload;
			localStorage.setItem("auth_token", action.payload);
		},
		removeToken(state) {
			state.token = null;
			localStorage.removeItem("auth_token");
		},
		setAuthRouter: (state, action: PayloadAction<string[]>) => {
			state.authRouter = action.payload;
			localStorage.setItem("auth_router", JSON.stringify(action.payload));
		},
		removeAuthRouter(state) {
			state.authRouter = [];
			localStorage.removeItem("auth_router");
		},
		setAuthButtons: (
			state,
			action: PayloadAction<{
				[propName: string]: any;
			}>
		) => {
			state.authButtons = action.payload;
			localStorage.setItem("auth_buttons", JSON.stringify(action.payload));
		},
		removeAuthButtons(state) {
			state.authButtons = {};
			localStorage.removeItem("auth_buttons");
		}
	}
});

// 导出 actions 和 reducer
export const {
	setToken,
	removeToken,
	setAuthRouter,
	setAuthButtons,
	removeAuthButtons,
	removeAuthRouter
} = authSlice.actions;
export default authSlice.reducer;
