import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
            isLoading: false,
            errorMessage: null
        },
   reducers: {
      setUsers: (state, action) => {
         state.users = action.payload.users;
      },
       checkingIsLoading: (state) => {
         state.isLoading = true;
       }
   }
});

// Action creators are generated for each case reducer function
export const { setUsers, checkingIsLoading } = userSlice.actions;