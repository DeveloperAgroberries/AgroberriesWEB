import { createSlice } from '@reduxjs/toolkit';

export const providerSlice = createSlice({
	name: 'provider',
   	initialState: {
    	providers: [],
        isLoading: false,
        errorMessage: null,
   	},
   	reducers: {
    	setProviders: (state, action ) => {
        	state.providers = action.payload.providers;
         	state.isLoading = false;
         	state.errorMessage = null;
      	},
      	addNewProvider: (state, action) => {
        	state.providers.push(action.payload.provider);
        	state.isLoading = false;
        	state.errorMessage = action.payload?.errorMessage || null;
       	},
       	updateProvider: (state, action) => {
        	const updateProvider = action.payload.provider;
        	state.providers = state.providers.map(provider =>
            	provider.cControlPrv === updateProvider.cControlPrv ? updateProvider : provider
         	);
         	state.isLoading = false;
         	state.errorMessage = action.payload?.errorMessage || null;
       	},
       	deleteProviderById: (state, action) => {
			const providerId = action.payload.id;
			state.providers = state.providers.filter(provider => provider.cControlPrv !== providerId);
			state.isLoading = false;
			state.errorMessage = null;
       	},
       	checkingIsLoading: (state) => {
        	state.isLoading = true;
       	}
   	}
});

// Action creators are generated for each case reducer function
export const { setProviders, addNewProvider, updateProvider, deleteProviderById, checkingIsLoading } = providerSlice.actions;