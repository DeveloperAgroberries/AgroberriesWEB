import { nominaApi } from "../api/nominaApi"; 

//Editar
export const modNomina = async(nomina) => {
    // console.log('Llegue: '+JSON.stringify(nomina, null, 2));
    // return
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await nominaApi.put('/updateNomina',nomina);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}