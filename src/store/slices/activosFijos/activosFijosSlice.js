import { createSlice } from '@reduxjs/toolkit';

export const activosFijosSlice = createSlice({
    name: 'activosFijos', // Nombre del slice
    
    initialState: {
        // 1. Para manejar el estado de carga (loading)
        isLoading: false,
        // 2. Para almacenar los datos de las solicitudes consultadas
        solicitudes: [],
        // 3. Para manejar mensajes de error (útil para el feedback al usuario)
        errorMessage: null, 
    },
    
    reducers: {
        // Reducer 1: Activa el estado de carga
        checkingIsLoading: (state) => {
            state.isLoading = true;
            state.errorMessage = null; // Limpia errores anteriores al empezar una nueva acción
        },
        
        // Reducer 2: Almacena las solicitudes después de una consulta (usado por getSolicitudes)
        setSolicitudes: (state, action) => {
            state.isLoading = false;
            state.solicitudes = action.payload.solicitudes;
            state.errorMessage = null;
        },

        // Reducer 3: Maneja el error al intentar insertar una solicitud (usado por iniciarSolicitud)
        // Nota: Este tipo de gestión de errores a menudo se maneja mejor con un extraReducer 
        // si usas createAsyncThunk, pero para un thunk simple, lo definimos aquí.
        // El nombre de la acción debe ser el mismo que usas en el dispatch de tu thunk: 'ADD_REGISTRO_ERROR'
        ADD_REGISTRO_ERROR: (state, action) => {
            state.isLoading = false;
            state.errorMessage = action.payload; // El payload es el 'errorMessage'
        },
    }
});

// 🚀 Exporta las acciones para que puedan ser usadas en tus thunks o componentes
export const { checkingIsLoading, setSolicitudes, ADD_REGISTRO_ERROR } = activosFijosSlice.actions;