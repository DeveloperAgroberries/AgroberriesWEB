import { createSlice } from '@reduxjs/toolkit';

export const reporteBaseSlice = createSlice({
   name: 'transportBaseReport',
   initialState: {
        reports: [],
        transportBaseFilters: [],
        isLoading: false,
        showView: false
   },
   reducers: {
      setBaseReports: (state, action) => {
         state.reports = action.payload.reports;
         state.isLoading = false;
      },

      setBaseFilters: (state, action) =>{
         state.transportBaseFilters = {
            ...state.transportBaseFilters,
            ...action.payload.transportBaseFilters
         };
         state.isLoading = false;
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
export const { setBaseReports, setBaseFilters, checkingIsLoadingReportSlice, checkingShowView, resetFilters, resetReports } = reporteBaseSlice.actions;