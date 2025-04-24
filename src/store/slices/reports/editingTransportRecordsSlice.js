import { createSlice } from '@reduxjs/toolkit';

export const editingTransportRecordsSlice = createSlice({
	name: 'editingTransportRecords',
   	initialState: {
    	reports: [],
        transportRecordsFilters: [],
        isLoading: false,
        showView: false
   	},
   	reducers: {
      	setReports: (state, action) => {
         	state.reports = action.payload.reports;
         	state.isLoading = false;
      	},

      	setTransportRecordsFilters: (state, action) =>{
         	state.transportRecordsFilters = {
            	...state.transportRecordsFilters,
            	...action.payload.transportRecordsFilters
         	};
         	state.isLoading = false;
      	},

      updateTransportRecords: (state, action) => {
			const updates = Array.isArray(action.payload.editingTransportRecords)
				? action.payload.editingTransportRecords
				: [action.payload.editingTransportRecords];

			state.reports = state.reports.map(record => {
				const update = updates.find(up => up.cCodigoTrn === record.cCodigoTrn);
				return update ? update : record;
			});

			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
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
        }
   	}
});

// Action creators are generated for each case reducer function
export const { setReports, setTransportRecordsFilters, updateTransportRecords, checkingIsLoadingReportSlice, checkingShowView, resetFilters, resetReports } = editingTransportRecordsSlice.actions;