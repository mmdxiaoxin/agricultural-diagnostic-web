import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TourState {
	hasShownConfigModalTour: boolean;
	hasShownInterfaceModalTour: boolean;
}

const initialState: TourState = {
	hasShownConfigModalTour: false,
	hasShownInterfaceModalTour: false
};

const tourSlice = createSlice({
	name: "tour",
	initialState,
	reducers: {
		markConfigModalTourShown: state => {
			state.hasShownConfigModalTour = true;
		},
		markInterfaceModalTourShown: state => {
			state.hasShownInterfaceModalTour = true;
		}
	}
});

export const { markConfigModalTourShown, markInterfaceModalTourShown } = tourSlice.actions;
export default tourSlice.reducer;
