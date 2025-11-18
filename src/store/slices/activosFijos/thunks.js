import { activosFijosApi } from "../../../api/activosFijosApi";
import { insertarSolicitud } from "../../../sqlserver/registrarSolicitudEquipo";
// 💡 IMPORTACIÓN CORREGIDA: Asegúrate de importar la acción ADD_REGISTRO_ERROR
import { checkingIsLoading, setSolicitudes, ADD_REGISTRO_ERROR } from "./activosFijosSlice"; 

//Consulta chofer Ricardo Dimas 
export const getSolicitudes = () => {
    return async( dispatch ) => {
        // Asumes que la API devuelve { data: { response: [...] } }
        const { data } = await activosFijosApi.get('/ListSolicitudesEquipo');
        
        // Verifica que la data.response exista y sea un array antes de despachar (opcional, pero buena práctica)
        if (data && data.response) {
            dispatch( setSolicitudes({ solicitudes: data.response }) );
        }
    }
}

//Insert chofer Ricardo Dimas 
export const iniciarSolicitud = (registro) =>{
    return async (dispatch) => {
        dispatch(checkingIsLoading());
        
        const result = await insertarSolicitud(registro);

        if( !result.ok){
            // 💡 AJUSTE 1: Usar la acción del slice directamente (más seguro y tipado)
            dispatch(ADD_REGISTRO_ERROR(result.errorMessage)); 
            return false;
        }

        // 💡 AJUSTE 2: No pasar el registro a getSolicitudes, ya que no lo necesita.
        dispatch(getSolicitudes()); 
        
        return true;
    };
};

export const marcarSolicitudTerminada = (solicitudId, nuevoEstado) =>{
    return async(dispatch) => {
        //return true; // Indica éxito
        try {
            // Aquí puedes empezar un dispatch(startLoading()); si quieres spinner global
            
            const { data } = await activosFijosApi.put(`/ActualizarEstado/${solicitudId}/${nuevoEstado}`);

            // Si la API devuelve un status 200/201
            if (data.ok === true) { 
                // No es estrictamente necesario actualizar el estado de Redux aquí,
                // ya que luego llamamos a getSolicitudes() para refrescar todo.
                dispatch(getSolicitudes()); 
                return true; // Indica éxito
            }

            return false; // Indica fallo de la API
            
        } catch (error) {
            console.log(error);
            // Opcional: dispatch(setError('Error al marcar como terminada.'));
            return false; // Indica fallo
        }
    }
}