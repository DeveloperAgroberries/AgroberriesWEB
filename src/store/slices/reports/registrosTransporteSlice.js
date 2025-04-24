import { createSlice } from '@reduxjs/toolkit';

export const registrosTransporteSlice = createSlice({
   name: 'registrosTransporte',
   initialState: {
        reports: [],
        registrosTransporteFilters: [],
        isLoading: false,
        showView: false
   },
   reducers: {
      setRegistrosTransporteReports: (state, action) => {
         state.reports = action.payload.reports;
         state.isLoading = false;
      },

      setRegistrosTransporteFilters: (state, action) =>{
         state.registrosTransporteFilters = {
            ...state.registrosTransporteFilters,
            ...action.payload.registrosTransporteFilters
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
export const { setRegistrosTransporteReports, setRegistrosTransporteFilters, checkingIsLoadingReportSlice, checkingShowView, resetFilters, resetReports } = registrosTransporteSlice.actions;