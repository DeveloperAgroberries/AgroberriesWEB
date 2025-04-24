import { createSlice } from '@reduxjs/toolkit';

export const nomWeekSlice = createSlice({
	name: 'nomWeek',
	initialState: {
		nomWeeks: []
	},
	reducers: {
		setNomWeeks: (state, action) => {
			state.nomWeeks = action.payload.nomWeeks;
            state.isLoading = false;
        },
        checkingIsLoading: (state) => {
            state.isLoading = true;
          }
    }
});

// Action creators are generated for each case reducer function
export const { setNomWeeks, checkingIsLoading} = nomWeekSlice.actions;