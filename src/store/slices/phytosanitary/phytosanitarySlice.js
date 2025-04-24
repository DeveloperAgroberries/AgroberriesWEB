import { createSlice } from '@reduxjs/toolkit';

export const phytosanitarySlice = createSlice({
	name: 'phytosanitary',
	initialState: {
		phytosanitaryRecords: [],
		tunnelTable: [],
		pests: [],
		lots: [],
		phytoFilters: [],
		isLoading: false,
        showView: false
	},
	reducers: {
		setPhytosanitaryRecords: (state, action) =>{
			state.phytosanitaryRecords = action.payload.phytosanitaryRecords;
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage;
		},
		setTunnelTable: (state, action) =>{
			state.tunnelTable = action.payload.tunnelTable;
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage;
		},
		setPests: (state, action) =>{
			state.pests = action.payload.pests;
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage;
		},
		setLots: (state, action) =>{
			state.lots = action.payload.lots;
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage;
		},
		setPhytoFilters:(state, action) => {
			state.phytoFilters = action.payload.phytoFilters;
         	state.isLoading = false;
			 state.errorMessage = action.payload?.errorMessage;
		},
		checkingIsLoadingPhytoReportSlice: (state) => {
			state.isLoading = true; 
		 },
   
		 checkingPhytoShowView: (state) => {
			state.showView = true;
		 }
	}
});

// Action creators are generated for each case reducer function
export const { setPhytosanitaryRecords, setTunnelTable, setPests, setLots, setPhytoFilters, checkingIsLoadingPhytoReportSlice, checkingPhytoShowView } = phytosanitarySlice.actions;
