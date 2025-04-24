import { createSlice } from '@reduxjs/toolkit';

export const selZoneSlice = createSlice({
   name: 'selZone',
   initialState: {
        selZones: [],
   },
   reducers: {
      setActiveZone: (state, action) => {
         state.selZones = action.payload.selZones;
      },
   }
});

// Action creators are generated for each case reducer function
export const { setActiveZone } = selZoneSlice.actions;