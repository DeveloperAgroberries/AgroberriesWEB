import { routesApi } from "../api/routesApi";


export const addRoute = async(route) => {
    try {
        const {data} = await routesApi.post('/SaveRoute',route);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const modRoute = async(route) => {
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await routesApi.patch('/EditRouteP',route);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const delRoute = async(route) => {
    //Cada que se actualice el WEBAPI en el servidor de IIS se tienen que agregar las siguientes lineas al Web.Config

//     <modules runAllManagedModulesForAllRequests="true">
//         <remove name="WebDAVModule"/>
//     </modules>

//Esto ayuda a que los metodos HTTPS funcionen de manera correcta porque los WebDAV interfieren con el correcto funcionamiento de los metodos PUT y DELETE

    try {
        const {data} = await routesApi.delete(`/DeleteRoute/${route}`);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}