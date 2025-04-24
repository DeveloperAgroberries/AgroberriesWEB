import { providersApi } from "../../../api/providersApi";
import { addProvider, modProvider, delProvider } from "../../../sqlserver/providers";
import { addNewProvider, checkingIsLoading, deleteProviderById, setProviders, updateProvider } from "./providerSlice";

export const getProviders = () =>{
    return async( dispatch ) => {
        dispatch(checkingIsLoading());
        try {
            const { data } = await providersApi.get('/ListProviders');
            dispatch( setProviders({ providers: data.response }) );
            return true;
        } catch (error) {
            dispatch({
                type: 'GET_PROVIDERS_ERROR',
                payload: error.errorMessage
            });
            return false;
        }
    }
}

export const startAddNewProvider = (provider) =>{
    return async (dispatch) => {
        dispatch(checkingIsLoading());
        const result = await addProvider(provider);
        
        if( !result.ok){
            dispatch({
                type: 'ADD_PROVIDER_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(addNewProvider({provider}));
        return true;
    };
};

export const startUpdateProvider = ( provider ) =>{
    return async( dispatch ) => {
        dispatch(checkingIsLoading());
        const result = await modProvider(provider);
        
        if( !result.ok){
            dispatch({
                type: 'UPDATE_PROVIDER_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(updateProvider({provider}));
        return true;
    };
};

export const startDeleteProvider = ( providerId) =>{
    return async( dispatch ) => {
        dispatch(checkingIsLoading());
        const result = await delProvider(providerId);
        
        if( !result.ok) {
            dispatch({
                type: 'DELETE_PROVIDER_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(deleteProviderById({id: providerId}));
        return true;
    };
};
