import { createSlice } from '@reduxjs/toolkit';

export const rindeGastosSlice = createSlice({
  name: 'rindeGastos',
  initialState: {
    resPoliza: [],        
    resGastos: null,
    resUsuarios: null,
    isLoadingPoliza: false, 
    loadingGastos: false,
    loadingUsuarios: false,
    error: null,
  },
  reducers: {
    // Sincronización de Gastos Masivos
    startSyncGastos: (state) => { state.loadingGastos = true; state.error = null; },
    syncGastosSuccess: (state, action) => { state.loadingGastos = false; state.resGastos = action.payload; },
    syncGastosError: (state, action) => { state.loadingGastos = false; state.error = action.payload; },

    // Sincronización de Catálogo de Usuarios
    startSyncUsers: (state) => { state.loadingUsuarios = true; state.error = null; },
    syncUsersSuccess: (state, action) => { state.loadingUsuarios = false; state.resUsuarios = action.payload; },
    syncUsersError: (state, action) => { state.loadingUsuarios = false; state.error = action.payload; },

    // Generación de Póliza (Replicado del Checador Facial)
    startGenerarPoliza: (state) => {
      state.isLoadingPoliza = true;
      state.error = null;
    },
    generarPolizaSuccess: (state, action) => {
      state.resPoliza = action.payload;
      state.isLoadingPoliza = false;
      state.error = null;
    },
    generarPolizaError: (state, action) => {
      state.isLoadingPoliza = false;
      state.error = action.payload;
    },

    // Limpieza de estados al desmontar la pantalla
    clearSyncState: (state) => {
      state.resPoliza = [];
      state.resGastos = null;
      state.resUsuarios = null;
      state.isLoadingPoliza = false;
      state.loadingGastos = false;
      state.loadingUsuarios = false;
      state.error = null;
    }
  }
});

export const {
  startSyncGastos, syncGastosSuccess, syncGastosError,
  startSyncUsers, syncUsersSuccess, syncUsersError,
  startGenerarPoliza, generarPolizaSuccess, generarPolizaError,
  clearSyncState
} = rindeGastosSlice.actions;

export default rindeGastosSlice.reducer;