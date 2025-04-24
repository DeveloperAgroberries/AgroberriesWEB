import { createSlice } from '@reduxjs/toolkit';

export const reportSlice = createSlice({
   name: 'report',
   initialState: {
        reports: [],
        filters: [],
        isLoading: false,
        showView: false
   },
   reducers: {
      setReports: (state, action) => {
         state.reports = action.payload.reports;
         state.isLoading = false;
      },

      setFilters: (state, action) =>{
         state.filters = {
            ...state.filters,
            ...action.payload.filters
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
   }
});

// Action creators are generated for each case reducer function
export const { setReports, setFilters, checkingIsLoadingReportSlice, checkingShowView, resetFilters } = reportSlice.actions;