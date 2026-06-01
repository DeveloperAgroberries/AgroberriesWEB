import { RindeGastosApi } from '../../../api/rindeGastosApi'; 
import { 
    startSyncGastos, syncGastosSuccess, syncGastosError,
    startSyncUsers, syncUsersSuccess, syncUsersError,
    startGenerarPoliza, generarPolizaSuccess, generarPolizaError
} from './rindeGastosSlice';

// 1. Thunk para Sincronizar Gastos Masivos
// export const startSyncManualGastos = () => {
//     return async (dispatch) => {
//         dispatch(startSyncGastos());
//         try {
//             const { data } = await RindeGastosApi.post('/SyncManual');
//             dispatch(syncGastosSuccess(data));
//         } catch (error) {
//             console.error(error);
//             const errorMsg = error.response?.data?.mensaje || 'Error al sincronizar gastos masivos';
//             dispatch(syncGastosError(errorMsg));
//         }
//     };
// };

export const startSyncManualGastos = ({ fechaInicio, fechaFin } = {}) => {
    return async (dispatch) => {
        dispatch(startSyncGastos());
        try {
            // Pasamos las fechas como query strings (?since=YYYY-MM-DD&until=YYYY-MM-DD)
            const { data } = await RindeGastosApi.get(`/SyncManual?since=${fechaInicio}&until=${fechaFin}`);
            dispatch(syncGastosSuccess(data));
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.mensaje || 'Error al sincronizar gastos masivos';
            dispatch(syncGastosError(errorMsg));
        }
    };
};

// 2. Thunk para Sincronizar Catálogo de Usuarios
export const startSyncCatalogoUsuarios = () => {
    return async (dispatch) => {
        dispatch(startSyncUsers());
        try {
            const { data } = await RindeGastosApi.post('/SyncUsers');
            dispatch(syncUsersSuccess(data));
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.mensaje || 'Error al sincronizar catálogo de usuarios';
            dispatch(syncUsersError(errorMsg));
        }
    };
};

// 3. Thunk para Ejecutar el SP de la Póliza (CORREGIDO: Sin "public" y con los nombres exactos)
export const startObtenerPolizaPeriodo = (filtros = {}) => {
    return async (dispatch) => {
        dispatch(startGenerarPoliza());
        try {
            const { data } = await RindeGastosApi.get('/GenerarPoliza', {
                params: {
                    fechaIni: filtros.fechaInicio, // Mapea exactamente a lo que espera tu API
                    fechaFin: filtros.fechaFin
                }
            }); 
            dispatch(generarPolizaSuccess(data));
        } catch (error) {
            console.error('Error al generar la póliza:', error);
            const msgError = error.response?.data?.mensaje || error.message || 'Error interno al procesar la póliza.';
            dispatch(generarPolizaError(msgError));
        }
    };
};