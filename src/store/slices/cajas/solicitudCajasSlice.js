import { createSlice } from '@reduxjs/toolkit';

export const solicitudCajasSlice = createSlice({
    name: 'solicitudCajas',
    initialState: {
        registros: [],
        isLoading: false,
        coolers: [], 
        tamanios: [], 
        campos: [],
        SKUs: []
    },
    reducers: {
        addRegistro: (state, action) => {
            state.registros.push(action.payload);
        },
        removeRegistro: (state, action) => {
            state.registros = state.registros.filter(reg => reg.id !== action.payload);
        },
        // NUEVO REDUCER: Modifica un elemento existente directamente en el State
        updateRegistroState: (state, action) => {
            const { id, data } = action.payload;
            const index = state.registros.findIndex(reg => reg.id === id);
            if (index !== -1) {
                state.registros[index] = { ...state.registros[index], ...data };
            }
        },
        clearRegistros: (state) => {
            state.registros = [];
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCatalogos: (state, action) => {
            state.coolers = action.payload.coolers;
            state.tamanios = action.payload.tamanios;
            state.campos = action.payload.campos; 
            state.SKUs = action.payload.SKUs; 
        }
    }
});

// No olvides exportar la nueva acción
export const { 
    addRegistro, 
    removeRegistro, 
    updateRegistroState, 
    clearRegistros, 
    setLoading, 
    setCatalogos 
} = solicitudCajasSlice.actions;