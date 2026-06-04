import { createSlice } from '@reduxjs/toolkit';

export const solicitudCajasSlice = createSlice({
    name: 'solicitudCajas',
    initialState: {
        registros: [],
        isLoading: false,
        coolers: [], // Nuevo estado
        tamanios: [], // Nuevo estado
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
        clearRegistros: (state) => {
            state.registros = [];
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCatalogos: (state, action) => {
            state.coolers = action.payload.coolers;
            state.tamanios = action.payload.tamanios;
            state.campos = action.payload.campos; // Nuevo
            state.SKUs = action.payload.SKUs; // Nuevo
        }
    }
});

export const { addRegistro, removeRegistro, clearRegistros, setLoading, setCatalogos } = solicitudCajasSlice.actions;