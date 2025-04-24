import { zonesApi } from "../../../api/zonesApi";
import { checkingIsLoading, setZones } from "./zoneSlice";

export const getZones = () => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        try{
            const { data } = await zonesApi.get('/ListZones');
            dispatch( setZones({ zones: data.response }) );
            return true;
        }catch(error){
            dispatch({ 
                type: 'GET_ZONES_ERROR', 
                payload: error.errorMessage
            });
            return false;
        }
    }
}