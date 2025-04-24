import { vehiclesApi } from "../api/vehiclesApi";


export const addVehicle = async(vehicle) => {
    
    try {
        const {data} = await vehiclesApi.post('/SaveVehicle',vehicle);
        //data regresa un jSON con mensaje:Ok
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const modVehicle = async(vehicle) => {
    
    try {
        //Cambiar los demas metodos a un PATCH para evitar problemas
        const {data} = await vehiclesApi.patch('/EditVehicleP',vehicle);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}

export const delVehicle = async(vehicle) => {
    //Cada que se actualice el WEBAPI en el servidor de IIS se tienen que agregar las siguientes lineas al Web.Config

//     <modules runAllManagedModulesForAllRequests="true">
//         <remove name="WebDAVModule"/>
//     </modules>

//Esto ayuda a que los metodos HTTPS funcionen de manera correcta porque los WebDAV interfieren con el correcto funcionamiento de los metodos PUT y DELETE

    try {
        const {data} = await vehiclesApi.delete(`/DeleteVehicle/${vehicle}`);
        return{
            ok: true
        }
    } catch (error) {
        return {ok: false, errorMessage: error.message}
    }
}