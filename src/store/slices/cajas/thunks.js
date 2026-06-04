import { setLoading } from "./solicitudCajasSlice";
import { agregarSolicitudCajas } from "../../../sqlserver/cajasCRUD";


export const startGuardarSolicitud = (datosSolicitud) => {
    return async (dispatch) => {
        dispatch(setLoading(true)); // Indicamos que empieza el proceso
        
        try {
            // Delegamos la petición al archivo externo que hace todo el trabajo
            const respuesta = await agregarSolicitudCajas.guardar(datosSolicitud);
            
            // Retornamos true si el CRUD indica éxito
            return respuesta; 
            
        } catch (error) {
            console.error("Error al guardar:", error);
            return false; // Retornamos false para que el componente sepa que falló
        } finally {
            dispatch(setLoading(false)); // Apagamos el loading en Redux
        }
    };
};