import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        status: 'not-authenticated',
        cCodigoUsu: null,
        vNombreUsu: null,
        vEmailUsu: null,
        Permissions: [],
        errorMessage: null,
    },
    reducers: {
        login: (state, {payload}) => {
            state.status = 'authenticated',
            state.cCodigoUsu = payload.cCodigoUsu.trim();
            state.vNombreUsu = payload.vNombreUsu.trim();
            state.vEmailUsu = payload.vEmailUsu.trim();
            state.Permissions = payload.Permissions;
            state.errorMessage = null;
        },

        logout: (state, {payload}) => {
            state.status = 'not-authenticated',
            state.cCodigoUsu = null;
            state.vNombreUsu = null;
            state.vEmailUsu = null;
            state.Permissions = [];
            state.errorMessage = payload?.errorMessage;
        },

        checkingCredentials: (state) => {
            state.status = 'checking';
        }
   }
});

// Action creators are generated for each case reducer function
export const { login, logout, checkingCredentials } = authSlice.actions;