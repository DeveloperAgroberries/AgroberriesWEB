import { createSlice } from '@reduxjs/toolkit';

export const fieldSlice = createSlice({
    name: 'field',
    initialState: {
        fields: [],
            isLoading: false,
            errorMessage: null
        },
   reducers: {
      setFields: (state, action) => {
         state.fields = action.payload.fields;
      },
       checkingIsLoading: (state) => {
         state.isLoading = true;
       }
   }
});

// Action creators are generated for each case reducer function
export const { setFields, checkingIsLoading } = fieldSlice.actions;