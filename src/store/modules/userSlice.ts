import { User } from "@/api/interface/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
	user: User;
}

const initialState: UserState = {
	user: {} as User
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		}
	}
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
