import { createSlice } from '@reduxjs/toolkit';

export const selProviderSlice = createSlice({
   name: 'selProvider',
   initialState: {
        selProviders: []
   },
   reducers: {
    setActiveProvider: (state, action ) => {
         state.selProviders = action.payload.selProviders;
      },
   }
});

// Action creators are generated for each case reducer function
export const { setActiveProvider } = selProviderSlice.actions;