import { createSlice } from '@reduxjs/toolkit';

export const zoneSlice = createSlice({
    name: 'zone',
    initialState: {
        zones: [],
        isLoading:false,
    },
    reducers: {
        setZones: (state, action) => {
            state.zones = action.payload.zones;
            state.isLoading = false;
        },
        checkingIsLoading: (state) => {
            state.isLoading = true;
          }
    }
});

// Action creators are generated for each case reducer function
export const { setZones, checkingIsLoading } = zoneSlice.actions;