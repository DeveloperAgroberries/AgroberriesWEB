import { vehiclesApi } from "../../../api/vehiclesApi";
import { addVehicle, delVehicle, modVehicle } from "../../../sqlserver/vehicles";
import { addNewVehicle, checkingIsLoading, deleteVehicleById, setVehicles, updateVehicle } from "./vehicleSlice";

export const getVehicles = () =>{
    return async( dispatch ) => {
		dispatch(checkingIsLoading());

		try{
			const { data } = await vehiclesApi.get('/ListVehicles');
			dispatch( setVehicles({ vehicles: data.response }) );
			return true;
		}catch(error){
			dispatch({
				type: 'GET_VEHICLES_ERROR',
				payload: error.errorMessage
			});
			return false;
		}
    };
};

export const startAddNewVehicle = (vehicle) =>{
    return async (dispatch) => {
		dispatch(checkingIsLoading());
        const result = await addVehicle(vehicle);

        if( !result.ok){
			dispatch({
				type: 'ADD_VEHICLE_ERROR',
				payload: result.errorMessage
			});
			return false;
		}

		dispatch(addNewVehicle({vehicle}));
		return true;
    };
};

export const startUpdateVehicles = ( vehicle ) =>{
    return async( dispatch ) => {
		dispatch(checkingIsLoading());

        const result = await modVehicle(vehicle);
        
        if( !result.ok){
			dispatch({
				type: 'UPDATE_ROUTE_ERROR',
				payload: result.errorMessage
			});
			return false;
		}
		
		dispatch(updateVehicle({vehicle}));
		return true;
    }
}

export const startDeleteVehicles = ( vehicleId) =>{
    return async( dispatch ) => {
		dispatch(checkingIsLoading());

        const result = await delVehicle(vehicleId);
        
        if( !result.ok){
			dispatch({
				type: 'DELETE_VEHICLE_ERROR',
				payload: result.errorMessage
			});
			return false;
		}

		dispatch(deleteVehicleById({id: vehicleId}));
		return true;
    }
}
