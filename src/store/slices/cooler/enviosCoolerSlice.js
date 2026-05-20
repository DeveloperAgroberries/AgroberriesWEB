import { createSlice } from '@reduxjs/toolkit';

export const enviosCoolerSlice = createSlice({
    name: 'enviosCooler',
    initialState: {
        envios: [],
        coolers: [], // 🚩 Nuevo: para guardar el catálogo de sedes
        isLoading: false,
    },
    reducers: {
        setLoading: (state) => {
            state.isLoading = true;
        },
        setEnvios: (state, action) => {
            state.envios = action.payload;
            state.isLoading = false;
        },
        // 🚩 Nuevo: para llenar el select desde el endpoint
        setCoolers: (state, action) => {
            state.coolers = action.payload;
        },
    }
});

export const { setLoading, setEnvios, setCoolers } = enviosCoolerSlice.actions;