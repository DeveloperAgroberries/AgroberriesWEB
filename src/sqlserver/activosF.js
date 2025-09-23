import { activosApi } from "../api/combustiblesApi";

export const getActivos = async () => {

    try {
        const { data } = await activosApi.get('/ListActivosF');
        //data regresa un jSON con mensaje:Ok
        return {
            ok: true
        }
    } catch (error) {
        return { ok: false, errorMessage: error.message }
    }
}

export const addActivoF = async (afData) => {
    // console.log(afData);
    // return
    try {
        const { data } = await activosApi.post('/insertAF', afData);
        //data regresa un jSON con mensaje:Ok
        return {
            ok: true
        }
    } catch (error) {
        return { ok: false, errorMessage: error.message }
    }
}

//Editar Activo
export const modActivo = async (activo) => {
    const { cNumeconAfi, vNombreAfi, vPlacasAfi, cRutafactAfi } = activo;
    // console.log('Llegue al sql: ' + JSON.stringify(activo, null, 2));
    // console.log('Activo: ' + vNombreAfi + ' Placas: ' + vPlacasAfi);
    //return
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const url = `/updateActivo?cNumeconAfi=${cNumeconAfi}&vNombreAfi=${vNombreAfi}&vPlacasAfi=${vPlacasAfi}&cRutafactAfi=${cRutafactAfi}`;
        const { data } = await activosApi.put(url);
        return {
            ok: true
        }
    } catch (error) {
        return { ok: false, errorMessage: error.message }
    }
}

//Editar Extras
export const modExtras = async(extrasTIObject) => {
    //console.log('Llegue API: '+JSON.stringify(extrasTIObject, null, 2));
    //return
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await activosApi.put('/updateExtrasTI',extrasTIObject);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}