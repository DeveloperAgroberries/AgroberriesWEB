import { routesApi } from "../../../api/routesApi";
import { addRoute, modRoute, delRoute } from "../../../sqlserver/routes";
import { addNewRoute, checkingIsLoading, deleteRouteById, setRoutes, updateRoute } from "./routesSlice";

export const getRoutes = () => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        try{
            const { data } = await routesApi.get('/ListRoutes');
            dispatch(setRoutes({ routes: data.response }));
            return true;
        }catch(error){
            dispatch({ 
                type: 'GET_ROUTES_ERROR', 
                payload: error.errorMessage
            });
            return false;
        }
    };
};

export const startAddNewRoute = (route) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());
        const result = await addRoute(route);

        if (!result.ok) {
            dispatch({ 
                type: 'ADD_ROUTE_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        } 

        // Despacha la acción con los datos actualizados
        dispatch(addNewRoute({route}));
        return true;
    };
};

export const startUpdateRoutes = (route) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        const result = await modRoute(route);

        if (!result.ok) {
            dispatch({ 
                type: 'UPDATE_ROUTE_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        } 

        // Despacha la acción con los datos actualizados
        dispatch(updateRoute({route}));
        return true;
    };
};

export const startDeleteRoutes = (routeId) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        const result = await delRoute(routeId);

        if (!result.ok) {
            dispatch({ 
                type: 'DELETE_ROUTE_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        } 

        // Despacha la acción con los datos actualizados
        dispatch(deleteRouteById({ id: routeId }));
        return true;
    }
}
