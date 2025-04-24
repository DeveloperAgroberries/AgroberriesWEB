import { createSlice } from '@reduxjs/toolkit';

export const routeBudgetSlice = createSlice({
    name: 'routeBudget',
    initialState: {
        routesBudget: [],
        isLoading: false,
        errorMessage: null
    },
    reducers: {
        setRoutesBudget: (state, action) => {
            state.routesBudget = action.payload.routesBudget;
            state.isLoading = false;
            state.errorMessage = null;
        },
        addNewRouteBudget: (state, action) => {
            state.routesBudget.push(action.payload.routeBudget)
            state.isLoading = false;
            state.errorMessage = action.payload?.errorMessage || null;
        },
        updateRouteBudget: (state, action) => {
            const updateRouteBudget = action.payload.routeBudget;
            state.routesBudget = state.routesBudget.map(routeBudget =>
                routeBudget.cControlPru === updateRouteBudget.cControlPru ? updateRouteBudget : routeBudget
            );
            state.isLoading = false;
            state.errorMessage = action.payload?.errorMessage || null;
        },
        deleteRouteBudgetById: (state, action) => {
            const routeBudgetId = action.payload.id;
            state.routesBudget = state.routesBudget.filter(routeBudget => routeBudget.cControlPru !== routeBudgetId);
            state.isLoading = false;
            state.errorMessage = null;
        },
        checkingIsLoading: (state) => {
            state.isLoading = true;
        }
    },
});

export const { setRoutesBudget, addNewRouteBudget, updateRouteBudget, deleteRouteBudgetById, checkingIsLoading } = routeBudgetSlice.actions;

export default routeBudgetSlice.reducer;