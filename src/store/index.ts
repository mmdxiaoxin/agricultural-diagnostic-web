import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 使用 localStorage
import authReducer from "./modules/authSlice";
import platformReducer from "./modules/platformSlice";

// 配置 Redux Persist
const persistConfig = {
	key: "root", // 主存储键
	storage, // 使用 localStorage
	whitelist: ["auth"] // 只有 auth 会被持久化
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// 创建 Redux store
export const store = configureStore({
	reducer: {
		auth: persistedAuthReducer, // token 持久化
		platform: platformReducer // 平台信息
	},
	devTools: process.env.NODE_ENV !== "production"
});

// 创建持久化存储实例
export const persistor = persistStore(store);
