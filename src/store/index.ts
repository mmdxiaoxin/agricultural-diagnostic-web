import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/es/storage";
import authReducer from "./modules/authSlice";
import breadcrumbReducer from "./modules/breadcrumbSlice";
import globalReducer from "./modules/globalSlice";
import menuReducer from "./modules/menuSlice";
import tabsReducer from "./modules/tabsSlice";
import tourReducer from "./modules/tourSlice";
import userReducer from "./modules/userSlice";

// 设置持久化配置
const persistConfig = {
	key: "root",
	storage,
	whitelist: ["auth", "tour"]
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedTourReducer = persistReducer(persistConfig, tourReducer);

// 创建 Redux store
export const store = configureStore({
	reducer: {
		auth: persistedAuthReducer,
		user: userReducer,
		menu: menuReducer,
		tabs: tabsReducer,
		breadcrumb: breadcrumbReducer,
		global: globalReducer,
		tour: persistedTourReducer
	},
	devTools: process.env.NODE_ENV !== "production",
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST"], // 忽略 `persist/PERSIST` 动作的序列化检查
				ignoredPaths: ["auth"] // 忽略 `auth` 路径的序列化检查
			}
		})
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
