import { vehicleAccessApi } from "../api/vehicleAccessApi";

//Insertar Chofer
export const addChofer = async(registro) => {
    // console.log('Llegue: '+[registro]);
    // return
    try {
        const {data} = await vehicleAccessApi.post('/insertChofer',registro);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

//Editar
export const modChofer = async(chofer) => {
    // console.log('Llegue: '+JSON.stringify(chofer, null, 2));
    // return
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await vehicleAccessApi.put('/updateChofer',chofer);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}