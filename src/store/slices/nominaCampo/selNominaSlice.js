import { createSlice } from '@reduxjs/toolkit';

// ... (imports)

export const selNominaSlice = createSlice({
    name: 'selNomina',
    initialState: {
        departamentos: [],
        actividades: [],
        filterDep: [],
        isLoading: false, // <-- Añadir este estado
        errorMessage: null, // <-- Añadir este estado
    },
    reducers: {
        setDepartamentos: (state, action) => {
            state.departamentos = action.payload.departamentos;
        },

        setActividades: (state, action) => {
            state.actividades = action.payload.actividades;
        },

        setRegistrosDepartamentos: (state, action) => {
            state.filterDep = action.payload.filterDep;
            state.isLoading = false; // Se detiene la carga
            state.errorMessage = null; // Limpiar cualquier error previo
        },
        // --- Nuevos reducers para manejar el estado de carga y error de filterDep
        startLoadingDepartamentos: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.filterDep = []; // Limpiar datos anteriores mientras carga
        },
        departamentosLoadError: (state, action) => {
            state.isLoading = false;
            state.errorMessage = action.payload; // Guardar el mensaje de error
            state.filterDep = []; // Asegurarse de que el arreglo esté vacío en caso de error
        },
        clearDepartamentos: (state) => {
            state.filterDep = [];
            state.isLoading = false;
            state.errorMessage = null;
        }
    }
});

// Exporta también los nuevos action creators
export const {
    setDepartamentos,
    setActividades,
    setRegistrosDepartamentos,
    startLoadingDepartamentos, // <-- Exportar
    departamentosLoadError,     // <-- Exportar
    clearDepartamentos          // <-- Exportar
} = selNominaSlice.actions;