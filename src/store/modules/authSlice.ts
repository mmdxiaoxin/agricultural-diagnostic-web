import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义 token 类型
interface AuthState {
    token: string | null;
}

const initialState: AuthState = {
    token: null,
};

// 创建 authSlice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload; // 设置 token
        },
        clearToken: (state) => {
            state.token = null; // 清除 token
        },
    },
});

// 导出 action 和 reducer
export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
