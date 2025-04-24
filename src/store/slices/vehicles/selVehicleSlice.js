import { createSlice } from '@reduxjs/toolkit';

export const selVehicleSlice = createSlice({
    name: 'selVehicle',
    initialState: {
        selVehicles: [],
    },
    reducers: {
        setActiveVehicle: (state, action) => {
            state.selVehicles = action.payload.selVehicles;
        },
    }
});

// Action creators are generated for each case reducer function
export const { setActiveVehicle } = selVehicleSlice.actions;