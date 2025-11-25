// src/features/reporteChecador/thunks.js
import { checadorFacialApi } from "../../../api/reporteChecadorFacialApi"; // ¡Ahora sabemos que es una instancia de Axios!
import { 
    setLoading,           
    setReporteData,       
    setReporteError       
} from "./reporteChecadorFacialSlice";

export const startLoadingReporteChecador = (filtros = {}) => {
    return async (dispatch) => {
        dispatch(setLoading());

        try {
            // 🚀 MODIFICACIÓN CLAVE AQUÍ: Pasando los filtros como 'params' a Axios
            const { data } = await checadorFacialApi.get('/ReporteChecadorFacial', {
                params: {
                    // Aquí mapeamos los filtros de tu estado a los nombres de parámetros que tu API espera
                    // Asegúrate que estos nombres coincidan con los que tu backend utiliza
                    fechaInicio: filtros.fechaInicio,
                    //horaInicio: filtros.horaInicio,
                    fechaFin: filtros.fechaFin,
                    //horaFin: filtros.horaFin,
                    // Si tienes más filtros, añádelos aquí
                }
            });

            dispatch(setReporteData({ reporteData: data }));
            
        } catch (error) {
            console.error('Error al cargar el reporte del checador:', error);
            const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido del servidor.';
            dispatch(setReporteError(errorMessage));
        }
    }
}

// export const startLoadingReporteChecador = (filterRAV) => {
//     console.log("Thunks - Filtros recibidos:", filterRAV); // 🚀 Línea de depuración
//     return async( dispatch ) => {
//         try {
//             // 🚀 MODIFICACIÓN CLAVE AQUÍ: Pasando los filtros como 'params' a Axios
//             const { data } = await checadorFacialApi.get(`/ReporteChecadorFacial/${filterRAV.startDate}/${filterRAV.endDate}`);

//             dispatch(setReporteData({ reporteData: data }));
            
//         } catch (error) {
//             console.error('Error al cargar el reporte del checador:', error);
            
//             const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido del servidor.';
            
//             dispatch(setReporteError(errorMessage));
//         }
//     }
// }
