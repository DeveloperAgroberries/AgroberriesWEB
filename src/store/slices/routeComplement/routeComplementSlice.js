import { createSlice } from '@reduxjs/toolkit';

export const routeComplementSlice = createSlice({
	name: 'routeComplement',
	initialState: {
        routeComplementFilters: [],
        isLoading: false,
        showView: false
	},
	reducers: {
		 setRouteComplementFilters: (state, action) =>{
			state.routeComplementFilters = {
			   ...state.routeComplementFilters,
			   ...action.payload.routeComplementFilters
			};
			state.isLoading = false;
		 },

	 	insertTransportRecord: (state, action) => {
		   	const updates = Array.isArray(action.payload.saveTransportRecord)
				? action.payload.saveTransportRecord
			   : [action.payload.saveTransportRecord];

		   	state.reports = state.reports.map(record => {
			   const update = updates.find(up => up.cCodigoTrn === record.cCodigoTrn);
			   return update ? update : record;
		   	});

		   	state.isLoading = false;
		   	state.errorMessage = action.payload?.errorMessage || null;
	   	},

		isLoadingRouteComplementSlice: (state) => {
			state.isLoading = true; 
		},

		showViewRouteComplement: (state) => {
			state.showView = true;
		},

		resetRouteComplementFilters: (state) => {
			state.routeComplementFilters = [];
		},
	}
});

// Action creators are generated for each case reducer function
export const { setRouteComplementFilters, insertTransportRecord, isLoadingRouteComplementSlice, showViewRouteComplement, resetRouteComplementFilters } = routeComplementSlice.actions;