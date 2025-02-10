import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	token: string | null;
	authRouter: string[];
	authButtons: {
		[propName: string]: any;
	};
}

const initialState: AuthState = {
	token: null,
	authRouter: [],
	authButtons: []
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
export const { setToken, setAuthRouter, setAuthButtons } = authSlice.actions;
export default authSlice.reducer;
