import { activosApi } from "../api/combustiblesApi";

export const getActivos = async() => {
    
    try {
        const {data} = await activosApi.get('/ListActivosF');
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const addActivoF = async(afData) => {
    // console.log(afData);
    // return
    try {
        const {data} = await activosApi.post('/insertAF',afData);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}