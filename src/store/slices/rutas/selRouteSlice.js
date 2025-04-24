import { createSlice } from '@reduxjs/toolkit';

export const selRouteSlice = createSlice({
   name: 'selRoute',
   initialState: {
        selRoutes: []
   },
   reducers: {
      setActiveRoute: (state, action ) => {
         state.selRoutes = action.payload.selRoutes;
      },
   }
});

// Action creators are generated for each case reducer function
export const { setActiveRoute } = selRouteSlice.actions;