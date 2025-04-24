import { createSlice } from '@reduxjs/toolkit';

export const transportAnalysisSlice = createSlice({
   name: 'transportAnalysis',
   initialState: {
        reports: [],
        transportAnalysisFilters: [],
		activeRecord: [],
        isLoading: false,
        showView: false
   },
   reducers: {
	setTransportAnalysisReports: (state, action) => {
		state.reports = action.payload.reports;
		state.isLoading = false;
	 },

	 setTransportAnalysisFilters: (state, action) =>{
		state.transportAnalysisFilters = {
		   ...state.transportAnalysisFilters,
		   ...action.payload.transportAnalysisFilters
		};
		state.isLoading = false;
	 },

	 setActiveRecord: (state, action) => {
		state.activeRecord = action.payload.activeRecord;
	 },

	 checkingIsLoadingReportSlice: (state) => {
		state.isLoading = true; 
	 },

	 checkingShowView: (state) => {
		state.showView = true;
	 },

	 resetFilters: (state) => {
		state.filters = [];
	 },

	resetReports: (state) => {
		state.reports = [];
	},
   }
});

// Action creators are generated for each case reducer function
export const {
	setTransportAnalysisReports,
	setTransportAnalysisFilters,
	setActiveRecord,
	checkingIsLoadingReportSlice,
	checkingShowView,
	resetFilters,
	resetReports
} = transportAnalysisSlice.actions;