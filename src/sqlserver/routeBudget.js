import { routesBudgetApi } from "../api/routesBudgetApi";


export const addRouteBudget = async(routeForAdd) => {
    try {
        const {data} = await routesBudgetApi.post('/SaveRouteBudget',routeForAdd);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const modRouteBudget = async(routeForMod) => {

    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await routesBudgetApi.patch('/EditRouteBudgetP',routeForMod);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const delRouteBudget = async(routeForDelete) => {
    //Cada que se actualice el WEBAPI en el servidor de IIS se tienen que agregar las siguientes lineas al Web.Config

//     <modules runAllManagedModulesForAllRequests="true">
//         <remove name="WebDAVModule"/>
//     </modules>

//Esto ayuda a que los metodos HTTPS funcionen de manera correcta porque los WebDAV interfieren con el correcto funcionamiento de los metodos PUT y DELETE

    try {
        const {data} = await routesBudgetApi.delete(`/DeleteRouteBudget/${routeForDelete}`);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}