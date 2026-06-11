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

// NUEVO DISPARADOR: Para actualizar una solicitud específica en la Base de Datos
export const startActualizarSolicitud = (id, datosActualizados) => {
    return async (dispatch) => {
        dispatch(setLoading(true)); // Activamos el spinner global de carga
        try {
            // Mapeamos los datos al formato exacto que espera tu modelo en C#
            const modeloBackend = {
                vCodcoolerCaj: datosActualizados.cooler,
                vCodcampoCaj: datosActualizados.cCodigoCam,
                vCodcultivoCaj: datosActualizados.cCodigoCul,
                vClienteCaj: datosActualizados.cliente,
                vSkuCaj: datosActualizados.sku,
                vVariedadCaj: datosActualizados.variedad,
                vEmbalajeCaj: datosActualizados.embalaje,
                iCajasCaj: parseInt(datosActualizados.cajas),
                vUsuarioCaj: datosActualizados.usuario || 'Usuario Modificador',
                dFechaCaj: datosActualizados.fecha.includes("T") ? datosActualizados.fecha : `${datosActualizados.fecha}T00:00:00.000Z`
            };

            const respuesta = await agregarSolicitudCajas.actualizar(id, modeloBackend);
            return respuesta; // Retorna true o false según la respuesta de la API
        } catch (error) {
            console.error(`Error al actualizar el registro ${id} en Thunk:`, error);
            return false;
        } finally {
            dispatch(setLoading(false)); // Apagamos el loading
        }
    };
};