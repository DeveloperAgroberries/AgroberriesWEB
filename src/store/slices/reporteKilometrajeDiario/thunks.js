
import {transportAppApi} from "../../../api/transportAppApi"
import { insertarSolicitud } from "../../../sqlserver/registrarSolicitudEquipo";
// 💡 IMPORTACIÓN CORREGIDA: Asegúrate de importar la acción ADD_REGISTRO_ERROR
import { checkingIsLoading, getReporteKilometraje, ADD_REGISTRO_ERROR } from "./activosFijosSlice"; 

//Consulta chofer Ricardo Dimas 
export const getReporteKilometraje = () => {
    return async( dispatch ) => {
        // Asumes que la API devuelve { data: { response: [...] } }
        const { data } = await transportAppApi.get('/ListKm');
        
        // Verifica que la data.response exista y sea un array antes de despachar (opcional, pero buena práctica)
        if (data && data.response) {
            dispatch( getReporteKilometraje({ kilometrajes: data.response }) );
        }
    }
}