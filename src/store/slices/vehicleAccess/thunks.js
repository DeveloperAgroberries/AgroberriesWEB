import { vehicleAccessApi } from "../../../api/vehicleAccessApi";
import { setVehicleAccessReports, setChoferes, addNewRegistroChofer, checkingIsLoadingChofer, updateChofer, checkingIsLoading } from "./vehicleAccessSlice";
import { addChofer, modChofer } from "../../../sqlserver/registroChofer";

export const getVehicleAccessRecords = (filterRAV) => {
	return async( dispatch ) => {
		const { data } = await vehicleAccessApi.get(`/ListIncome/${filterRAV.startDate}/${filterRAV.endDate}`);
		dispatch( setVehicleAccessReports({ reports: data.response }) );
	}
}

//Consulta chofer Ricardo Dimas - 07/06/2025
export const getChoferes = () => {
	return async( dispatch ) => {
		const { data } = await vehicleAccessApi.get('/ListChoferes');
		dispatch( setChoferes({ choferes: data.response }) );
	}
}

//Insert chofer Ricardo Dimas - 07/06/2025
export const startAddChofer = (registro) =>{
	return async (dispatch) => {
		dispatch(checkingIsLoadingChofer());
		
		const result = await addChofer(registro);

		if( !result.ok){
			dispatch({
				type: 'ADD_REGISTRO_ERROR',
				payload: result.errorMessage
			});
			return false;
		}

		dispatch(getChoferes(registro));
		return true;
	};
};

//Modificar chofer
export const startUpdateChofer = (chofer) => {
	return async(dispatch) => {
		dispatch(checkingIsLoading());

		const result = await modChofer(chofer);

		if (!result.ok) {
			dispatch({ 
				type: 'UPDATE_ROUTE_ERROR', 
				payload: result.errorMessage 
			});
			return false;
		} 

		// Despacha la acción con los datos actualizados
		dispatch(updateChofer({chofer}));
		return true;
	};
};