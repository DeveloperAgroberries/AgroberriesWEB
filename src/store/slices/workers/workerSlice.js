import { createSlice } from '@reduxjs/toolkit';

export const workerSlice = createSlice({
	name: 'worker',
	initialState: {
		workers: [],
			isLoading: false,
			errorMessage: null
	},
	reducers: {
		setWorkers: (state, action) => {
			state.workers = action.payload.workers;
		},
		checkingIsLoading: (state) => {
			state.isLoading = true;
		}
	}
});

// Action creators are generated for each case reducer function
export const { setWorkers, checkingIsLoading} = workerSlice.actions;