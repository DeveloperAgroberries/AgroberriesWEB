import { providersApi } from "../api/providersApi";

export const addProvider = async(provider) => {
    
    try {
        const {data} = await providersApi.post('/SaveProvider',provider);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const modProvider = async(provider) => {
    
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await providersApi.patch('/EditProviderP',provider);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const delProvider = async(provider) => {
    //Cada que se actualice el WEBAPI en el servidor de IIS se tienen que agregar las siguientes lineas al Web.Config

//     <modules runAllManagedModulesForAllRequests="true">
//         <remove name="WebDAVModule"/>
//     </modules>

//Esto ayuda a que los metodos HTTPS funcionen de manera correcta porque los WebDAV interfieren con el correcto funcionamiento de los metodos PUT y DELETE

    try {
        const {data} = await providersApi.delete(`/DeleteProvider/${provider}`);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}