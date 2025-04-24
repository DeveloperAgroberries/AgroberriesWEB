import { createSlice } from '@reduxjs/toolkit';

export const vehicleAccessSlice = createSlice({
   name: 'vehicleAccess',
   initialState: {
        reports: [],
        vehicleAccessFilters: [],
        isLoading: false,
        showView: false
   },
   reducers: {
    setVehicleAccessReports: (state, action) => {
        state.reports = action.payload.reports;
        state.isLoading = false;
     },

     setVehicleAccessFilters: (state, action) =>{
        state.vehicleAccessFilters = {
           ...state.vehicleAccessFilters,
           ...action.payload.vehicleAccessFilters
        };
        state.isLoading = false;
     },

     checkingIsLoadingVehicleAccessSlice: (state) => {
        state.isLoading = true; 
     },

     checkingShowViewVehicleAccess: (state) => {
        state.showView = true;
     },
     
     resetVehicleAccessFilters: (state) => {
        state.vehicleAccessFilters = [];
        state.isLoading = false;
     },

     resetVehicleAccessReports: (state) => {
        state.reports = [];
        state.isLoading = false;
     },
   }
});

// Action creators are generated for each case reducer function
export const { setVehicleAccessReports, setVehicleAccessFilters, checkingIsLoadingVehicleAccessSlice, checkingShowViewVehicleAccess, resetVehicleAccessFilters, resetVehicleAccessReports } = vehicleAccessSlice.actions;