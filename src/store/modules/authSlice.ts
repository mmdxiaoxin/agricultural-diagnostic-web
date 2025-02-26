import { localGet, localRemove, localSet } from "@/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	token: string | null;
	authRouter: string[];
	authButtons: {
		[propName: string]: any;
	};
}

const initialState: AuthState = {
	token: localGet("auth_token"),
	authRouter: localGet("auth_router") || [],
	authButtons: localGet("auth_buttons") || []
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken: (state, action: PayloadAction<string>) => {
			state.token = action.payload;
			localSet("auth_token", action.payload);
		},
		removeToken(state) {
			state.token = null;
			localRemove("auth_token");
		},
		setAuthRouter: (state, action: PayloadAction<string[]>) => {
			state.authRouter = action.payload;
			localSet("auth_router", action.payload);
		},
		removeAuthRouter(state) {
			state.authRouter = [];
			localRemove("auth_router");
		},
		setAuthButtons: (
			state,
			action: PayloadAction<{
				[propName: string]: any;
			}>
		) => {
			state.authButtons = action.payload;
			localSet("auth_buttons", action.payload);
		},
		removeAuthButtons(state) {
			state.authButtons = {};
			localRemove("auth_buttons");
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
