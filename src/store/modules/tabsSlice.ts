import { HOME_URL } from "@/config/config";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Tab {
	title: string;
	path: string;
}

interface TabsState {
	tabsActive: string;
	tabsList: Tab[];
}

const initialState: TabsState = {
	tabsActive: HOME_URL,
	tabsList: [{ title: "首页", path: HOME_URL }]
};

const tabsSlice = createSlice({
	name: "tabs",
	initialState,
	reducers: {
		setTabsList(state, action: PayloadAction<Tab[]>) {
			state.tabsList = action.payload;
		},
		addTab(state, action: PayloadAction<Tab>) {
			const index = state.tabsList.findIndex(item => item.path === action.payload.path);
			if (index === -1) {
				state.tabsList.push(action.payload);
			}
		},
		delTab(state, action: PayloadAction<string>) {
			const index = state.tabsList.findIndex(item => item.path === action.payload);
			if (index !== -1) {
				state.tabsList.splice(index, 1);
			}
		},
		setTabsActive(state, action: PayloadAction<string>) {
			state.tabsActive = action.payload;
		}
	}
});

export const { setTabsList, setTabsActive, addTab, delTab } = tabsSlice.actions;
export default tabsSlice.reducer;
