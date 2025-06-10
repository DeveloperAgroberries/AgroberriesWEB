import { activosApi } from "../../../api/combustiblesApi";
import { setCombustibles, setCampos, addNewRegistro, checkingIsLoadingTrabajador, setTrabajador, setErrorTrabajador, 
    setActivo, setErrorActivo, checkingIsLoadingActivo, checkingIsLoading,
    setReporte, setErrorReporte, checkingIsLoadingReporte } from "./combustiblesSlice";
import { addRegistro } from "../../../sqlserver/registroCombustible";

export const getCombustibles = () =>{
    return async( dispatch ) => {
        dispatch(checkingIsLoading());

        try{
            const { data } = await activosApi.get('/ListCombustiblesF');
            // console.log(data.response);
            dispatch( setCombustibles({ combustibles: data.response }) );
            // console.log({ combustibles: data.response });
            return true;
        }catch(error){
            dispatch({
                type: 'GET_COMBUSTIBLES_ERROR',
                payload: error.errorMessage
            });
            return false;
        }
    };
};

export const getCampos = () =>{
    return async( dispatch ) => {
        dispatch(checkingIsLoading());

        try{
            const { data } = await activosApi.get('/ListFields');
            dispatch( setCampos({ campos: data.response }) );
            // console.log({ CamposThunks: data.response });
            return true;
        }catch(error){
            dispatch({
                type: 'GET_CAMPOS_ERROR',
                payload: error.errorMessage
            });
            return false;
        }
    };
};

// export const getTrabajador = (codTrabajador) =>{
//     return async( dispatch ) => {
//         dispatch(checkingIsLoadingTrabajador());

//         try{
//             const { data } = await activosApi.get(`/WorkerData/${codTrabajador}`);
//             dispatch( setTrabajador({ trabajador: data.response }) );
//             // console.log({ CamposThunks: data.response });
//             return true;
//         }catch(error){
//             dispatch({
//                 type: 'GET_TRABAJADOR_ERROR',
//                 payload: error.errorMessage
//             });
//             return false;
//         }
//     };
// };

export const getTrabajador = (codTrabajador) => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingTrabajador()); // Usa la nueva acción de carga

        try {
            const { data } = await activosApi.get(`/WorkerData/${codTrabajador}`);

            if (data && data.response) {
                dispatch(setTrabajador(data.response)); // Usa la nueva acción de datos
                // console.log(data.response); // Muestra los datos del trabajador
            } else {
                dispatch(setErrorTrabajador("No se recibieron datos del Trabajador")); // Usa la nueva acción de error
            }
        } catch (error) {
            // console.error(`Error al cargar datos del Trabajador ${codTrabajador}:`, error); // mensaje solo para imprimir usuarios
            dispatch(setErrorTrabajador('No se encontro el usuario.'));
            // dispatch(setErrorTrabajador(error.message || `Error desconocido al cargar datos del Trabajador ${nombreP}`));
        }
    };
};

export const getActivo = (codActivo) => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingActivo()); // Usa la nueva acción de carga

        try {
            const { data } = await activosApi.get(`/FixedAssetData/${codActivo}`);

            if (data && data.response) {
                dispatch(setActivo(data.response)); // Usa la nueva acción de datos
                // console.log(data.response); // Muestra los datos del trabajador
            } else {
                dispatch(setErrorActivo("No se recibieron datos del activo")); // Usa la nueva acción de error
            }
        } catch (error) {
            // console.error(`Error al cargar datos del Trabajador ${codActivo}:`, error); // mensaje solo para imprimir usuarios
            dispatch(setErrorActivo('No se encontro el Activo.'));
            // dispatch(setErrorTrabajador(error.message || `Error desconocido al cargar datos del Trabajador ${nombreP}`));
        }
    };
};

export const startAddRegistroCombustible = (registro) =>{
    return async (dispatch) => {
        dispatch(checkingIsLoading());
        
        const result = await addRegistro(registro);

        if( !result.ok){
            dispatch({
                type: 'ADD_REGISTRO_ERROR',
                payload: result.errorMessage
            });
            return false;
        }

        dispatch(addNewRegistro({registro}));
        return true;
    };
};

export const getReporte = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingReporte());
        try {
            const { data } = await activosApi.get('/GetReporteCombustible');

            if (data && data.response) {
                dispatch(setReporte(data.response)); 
            } else {
                dispatch(setErrorReporte("No se recibieron datos para el reporte"));
            }
        } catch (error) {
            dispatch(setErrorReporte('No se encontro reporte.'));
        }
    };
};