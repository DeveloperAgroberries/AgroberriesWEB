import { createSlice } from '@reduxjs/toolkit';

export const nominaCampoSlice = createSlice({
    name: 'registrosNomina',
    initialState: {
        reports: [],
        registrosNominaFilters: [],
        isLoading: false,
        showView: false,
        errorMessage: null
    },
    reducers: {
        setRegistrosNominaReports: (state, action) => {
            state.reports = action.payload.reports;
            state.isLoading = false;
        },

        setRegistrosNominaFilters: (state, action) => {
            state.registrosNominaFilters = {
                ...state.registrosNominaFilters,
                ...action.payload.registrosNominaFilters
            };
            state.isLoading = false;
        },

        checkingIsLoadingNominaSlice: (state) => {
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

        updateNomina: (state, action) => {
            const updatedNominaItem = action.payload;

            state.reports = state.reports.map(report =>
                report.cCodigoNht === updatedNominaItem.cCodigoNht ? updatedNominaItem : report
            );
            state.isLoading = false;
            state.errorMessage = null; 
        },
    }
});

// Action creators are generated for each case reducer function
export const { setRegistrosNominaReports, setRegistrosNominaFilters, checkingIsLoadingNominaSlice, checkingShowView, resetFilters, resetReports, updateNomina } = nominaCampoSlice.actions;