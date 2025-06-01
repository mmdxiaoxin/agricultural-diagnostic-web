import { createSlice } from "@reduxjs/toolkit";

interface TourState {
	hasShownConfigModalTour: boolean;
	hasShownInterfaceModalTour: boolean;
	hasShownDiagnosisImageTour: boolean;
	hasShownDiagnosisTestTour: boolean;
}

const initialState: TourState = {
	hasShownConfigModalTour: false,
	hasShownInterfaceModalTour: false,
	hasShownDiagnosisImageTour: false,
	hasShownDiagnosisTestTour: false
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
		},
		markDiagnosisImageTourShown: state => {
			state.hasShownDiagnosisImageTour = true;
		},
		markDiagnosisTestTourShown: state => {
			state.hasShownDiagnosisTestTour = true;
		}
	}
});

export const {
	markConfigModalTourShown,
	markInterfaceModalTourShown,
	markDiagnosisImageTourShown,
	markDiagnosisTestTourShown
} = tourSlice.actions;
export default tourSlice.reducer;
