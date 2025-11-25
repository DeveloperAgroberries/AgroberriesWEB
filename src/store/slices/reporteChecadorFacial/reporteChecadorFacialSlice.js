// src/features/reporteChecador/reporteChecadorSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const reporteChecadorFacialSlice = createSlice({
  name: 'reporteChecador', // Nombre único para este slice
  initialState: {
    reporteData: [], // Cambié 'reports' a 'reporteData' para mayor claridad con el contexto
    filtros: { // Cambié 'transportBaseFilters' a 'filtros' y lo hice un objeto para manejar mejor los valores
      fechaInicio: '',
      fechaFin: '',
      //horaInicio: null,
      //horaFin: null,
      // Añade aquí cualquier otro filtro inicial que necesites
    },
    isLoading: false,
    showReporteView: false, // Cambié 'showView' a 'showReporteView' para mayor especificidad
    error: null, // Útil para manejar errores de carga en el futuro
  },
  reducers: {
    // Reducer para establecer los datos del reporte una vez cargados
    setReporteData: (state, action) => {
      state.reporteData = action.payload.reporteData; // Espera un payload { reporteData: [...] }
      state.isLoading = false; // Asumo que la carga terminó al recibir los datos
      state.error = null; // Limpiar cualquier error anterior
    },

    // Reducer para actualizar los filtros del reporte
    setFiltros: (state, action) => {
      state.filtros = {
        ...state.filtros,
        ...action.payload, // Espera un payload con los nuevos valores de filtro (ej: { fechaInicio: '2023-01-01' })
      };
      // Aquí no se cambia isLoading, ya que solo se establecen los filtros, no se carga el reporte aún.
    },

    // Reducer para indicar que se está cargando el reporte
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null; // Limpiar error al iniciar nueva carga
    },

    // Reducer para indicar que se debe mostrar la vista del reporte
    setShowReporteView: (state, action) => {
      state.showReporteView = action.payload; // Espera un booleano (true/false)
    },

    // Reducer para restablecer todos los filtros a su estado inicial
    resetFiltros: (state) => {
      state.filtros = {
        fechaInicio: null,
        fechaFin: null,
        //horaInicio: null,
        //horaFin: null,
      };
      // Puedes añadir más restablecimientos de filtros aquí si es necesario
    },

    // Reducer para limpiar los datos del reporte
    resetReporteData: (state) => {
      state.reporteData = [];
      state.isLoading = false;
      state.error = null;
    },

    // Reducer para establecer un error (útil para cuando integres la carga asíncrona)
    setReporteError: (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    },
  },
});

// Exporta los Action creators para cada función reducer
export const {
  setReporteData,
  setFiltros,
  setLoading,
  setShowReporteView,
  resetFiltros,
  resetReporteData,
  setReporteError,
} = reporteChecadorFacialSlice.actions;

// Exporta el reducer por defecto
export default reporteChecadorFacialSlice.reducer;

// --- Selectores (Opcional, pero recomendado para acceder al estado) ---
export const selectReporteData = (state) => state.reporteChecadorFacialSlice.reporteData; // CAMBIO
export const selectFiltros = (state) => state.reporteChecadorFacialSlice.filtros;         // CAMBIO
export const selectIsLoading = (state) => state.reporteChecadorFacialSlice.isLoading;     // CAMBIO
export const selectShowReporteView = (state) => state.reporteChecadorFacialSlice.showReporteView; // CAMBIO
export const selectReporteError = (state) => state.reporteChecadorFacialSlice.error;     // CAMBIO