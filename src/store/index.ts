import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./modules/authSlice";
import breadcrumbReducer from "./modules/breadcrumbSlice";
import globalReducer from "./modules/globalSlice";
import menuReducer from "./modules/menuSlice";
import tabsReducer from "./modules/tabsSlice";

export type RootState = ReturnType<typeof store.getState>;
// 创建 Redux store
export const store = configureStore({
	reducer: {
		auth: authReducer,
		menu: menuReducer,
		tabs: tabsReducer,
		breadcrumb: breadcrumbReducer,
		global: globalReducer
	},
	devTools: process.env.NODE_ENV !== "production"
});
