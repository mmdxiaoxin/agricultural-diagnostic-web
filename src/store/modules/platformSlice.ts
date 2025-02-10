import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义平台信息类型
interface PlatformState {
	platformName: string;
	platformVersion: string;
}

const initialState: PlatformState = {
	platformName: "Unknown",
	platformVersion: "Unknown"
};

// 创建 platformSlice
const platformSlice = createSlice({
	name: "platform",
	initialState,
	reducers: {
		setPlatformInfo: (state, action: PayloadAction<PlatformState>) => {
			state.platformName = action.payload.platformName;
			state.platformVersion = action.payload.platformVersion;
		}
	}
});

// 导出 action 和 reducer
export const { setPlatformInfo } = platformSlice.actions;
export default platformSlice.reducer;
