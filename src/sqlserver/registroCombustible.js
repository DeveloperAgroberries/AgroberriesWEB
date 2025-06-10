import { activosApi } from "../api/combustiblesApi";

export const addRegistro = async(registro) => {
    // console.log([registro]);
    // return
    try {
        const {data} = await activosApi.post('/SaveFuelRegisters',[registro]);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}