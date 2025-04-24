import { createSlice } from '@reduxjs/toolkit';

export const diningRoomSlice = createSlice({
	name: 'diningRoom',
   	initialState: {
    	diningRoomRecords: [],
        fieldByWorkerRecords: [],
        industrialDinnerUsers: [],
        diningRoomFilters: [],
        isLoading: false,
        showView: false
   	},
   	reducers: {
      	setDiningRoomRecords: (state, action ) => {
         	state.diningRoomRecords = action.payload.diningRoomRecords;
         	state.isLoading = false;
      	},
      	setFieldByWorkerRecords: (state, action ) => {
        	state.fieldByWorkerRecords = action.payload.fieldByWorkerRecords;
         	state.isLoading = false;
      	},
      	setIndustrialDinnerUsers: (state, action ) => {
         	state.industrialDinnerUsers = action.payload.industrialDinnerUsers;
         	state.isLoading = false;
      	},
      	setDiningRoomFilters: (state, action) =>{
         	state.diningRoomFilters = action.payload.diningRoomFilters;
         	state.isLoading = false;
      	},
      	checkingIsLoadingDiningRoom: (state) => {
        	state.isLoading = true;
      	},
      	checkingDiningRoomShowView: (state) => {
			state.showView = true;
		},
       	resetFilters: (state) => {
         	state.filters = [];
      	},
		resetDiningRoomRecords: (state) => {
			state.diningRoomRecords = [];
		}
   	}
});

// Action creators are generated for each case reducer function
export const { setDiningRoomRecords, setFieldByWorkerRecords, setIndustrialDinnerUsers, setDiningRoomFilters, checkingIsLoadingDiningRoom, checkingDiningRoomShowView, resetFilters, resetDiningRoomRecords } = diningRoomSlice.actions;