import { createSlice } from "@reduxjs/toolkit";
import { localGet, localSet } from "@/utils/storage";

interface TourState {
	hasShownConfigModalTour: boolean;
	hasShownInterfaceModalTour: boolean;
	hasShownDiagnosisImageTour: boolean;
	hasShownDiagnosisTestTour: boolean;
	hasShownExternalSourceTour: boolean;
}

// 从 localStorage 获取初始状态
const getInitialState = (): TourState => {
	const savedState = localGet("tour-state");
	return (
		savedState || {
			hasShownConfigModalTour: false,
			hasShownInterfaceModalTour: false,
			hasShownDiagnosisImageTour: false,
			hasShownDiagnosisTestTour: false,
			hasShownExternalSourceTour: false
		}
	);
};

const tourSlice = createSlice({
	name: "tour",
	initialState: getInitialState(),
	reducers: {
		markConfigModalTourShown: state => {
			state.hasShownConfigModalTour = true;
			localSet("tour-state", state);
		},
		markInterfaceModalTourShown: state => {
			state.hasShownInterfaceModalTour = true;
			localSet("tour-state", state);
		},
		markDiagnosisImageTourShown: state => {
			state.hasShownDiagnosisImageTour = true;
			localSet("tour-state", state);
		},
		markDiagnosisTestTourShown: state => {
			state.hasShownDiagnosisTestTour = true;
			localSet("tour-state", state);
		},
		markExternalSourceTourShown: state => {
			state.hasShownExternalSourceTour = true;
			localSet("tour-state", state);
		}
	}
});

export const {
	markConfigModalTourShown,
	markInterfaceModalTourShown,
	markDiagnosisImageTourShown,
	markDiagnosisTestTourShown,
	markExternalSourceTourShown
} = tourSlice.actions;
export default tourSlice.reducer;
