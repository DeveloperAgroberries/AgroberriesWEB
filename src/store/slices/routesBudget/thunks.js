import { routesBudgetApi } from "../../../api/routesBudgetApi";
import { addRouteBudget, delRouteBudget, modRouteBudget } from "../../../sqlserver/routeBudget";
import { addNewRouteBudget, checkingIsLoading, deleteRouteBudgetById, setRoutesBudget, updateRouteBudget } from "./routesBudgetSlice";


// export const getRoutesBudget = () => {
//     return async(dispatch) => {
//         const { data } = await routesBudgetApi.get('/ListRoutesBudget');
//         dispatch( setRoutesBudget({ routesBudget: data.response }) );
//     }
// }

// export const startAddNewRouteBudget = (routeForAdd) =>{
//     return async (dispatch) => {
//          const result = await addRouteBudget(routeForAdd);
        
//          if( !result.ok) return dispatch( {errorMessage: result.errorMessage} );
//          dispatch();
//     }
// }

// export const startUpdateRouteBudget = ( routeForAdd ) =>{
//     return async( dispatch ) => {
//         const result = await modRouteBudget(routeForAdd);

//         if( !result.ok) return dispatch( {errorMessage: result.errorMessage} );
//         dispatch();
//     }
// }

// export const startDeleteRouteBudget = ( routeForAdd) =>{
//     return async( dispatch ) => {
//         const result = await delRouteBudget(routeForAdd);
        
//         if( !result.ok) return dispatch( {errorMessage: result.errorMessage} );
//         dispatch();
//     }
// }

export const getRoutesBudget = () => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        try{
            const { data } = await routesBudgetApi.get('/ListRoutesBudget');
            dispatch( setRoutesBudget({ routesBudget: data.response }) );
            return true;
        }catch(error){
            dispatch({
                type: 'GET_ROUTES_BUDGET_ERROR',
                payload: error.errorMessage
            });
            return false;
        }
    };
};

// Thunk para agregar un nuevo presupuesto
export const startAddNewRouteBudget = (routeBudget) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());
        const result = await addRouteBudget(routeBudget);

        if(!result.ok){
            dispatch({
                type: 'ADD_ROUTE_BUDGET_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(addNewRouteBudget({routeBudget}));
        return true;
    };
};

// Thunk para actualizar un presupuesto existente
export const startUpdateRouteBudget = (routeBudget) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        const result = await modRouteBudget(routeBudget);

        if(!result.ok){
            dispatch({
                type: 'UPDATE_ROUTE_BUDGET_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(updateRouteBudget({routeBudget}));
        return true;
    };
};

// Thunk para eliminar un presupuesto
export const startDeleteRouteBudget = (routeBudgetId) => {
    return async(dispatch) => {
        dispatch(checkingIsLoading());

        const result = await delRouteBudget(routeBudgetId);
        
        if(!result.ok){
            dispatch({
                type:'DELETE_ROUTE_BUDGET_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(deleteRouteBudgetById({ id: routeBudgetId}));
        return true;
    };
};
