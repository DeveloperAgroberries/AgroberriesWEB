import { createSlice } from '@reduxjs/toolkit';

export const reclutadoresSlice = createSlice({
    name: 'reclutadores',
    initialState: {
        candidatos: [],
        listaReclutadores: [], // <--- Agregado: para evitar el undefined
        isLoading: false,
    },
    reducers: {
        setChecking: (state) => {
            state.isLoading = true;
        },
        setCandidatos: (state, action) => {
            state.isLoading = false;
            state.candidatos = action.payload;
        },
        // <--- Agregado: Acción para guardar los reclutadores
        setListaReclutadores: (state, action) => {
            state.listaReclutadores = action.payload;
        },
    }
});

export const { 
    setCandidatos, 
    setChecking, 
    setListaReclutadores // <--- Verifica que esté aquí también
} = reclutadoresSlice.actions;