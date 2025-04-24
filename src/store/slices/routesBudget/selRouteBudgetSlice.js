import { createSlice } from '@reduxjs/toolkit';

export const selRouteBudgetSlice = createSlice({
   name: 'selRouteBudget',
   initialState: {
        selRoutesBudget: []
   },
   reducers: {
      setActiveRouteBudget: (state, action ) => {
         state.selRoutesBudget = action.payload.selRoutesBudget;
      },
   }
});

// Action creators are generated for each case reducer function
export const { setActiveRouteBudget } = selRouteBudgetSlice.actions;