import { activosFijosApi } from "../api/activosFijosApi";

//Insertar Solicitud 
export const insertarSolicitud = async(registro) => {
    console.log('Llegue: '+[registro]);
    // return
    try {
        const {data} = await activosFijosApi.post('/InsertarSolicitud',registro);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}