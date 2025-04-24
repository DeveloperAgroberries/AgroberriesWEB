import { transportRecordsApi } from "../../../api/transportRecordsApi";
import { insertTransportRecord, isLoadingRouteComplementSlice } from "./routeComplementSlice";

export const startSaveTransportRecord = (saveTransportRecord) => {
    return async(dispatch) => {
        dispatch(isLoadingRouteComplementSlice());

        const result = await transportRecordsApi.post('/SaveRouteComplement', saveTransportRecord);

        if (result.status != 200) {
            dispatch({ 
                type: 'UPDATE_TRANSPORT_RECORDS_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        }

        // Despacha la acción con los datos actualizados
        dispatch(insertTransportRecord({saveTransportRecord}));
        return true;
    };
}; 
