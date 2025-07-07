import { nominaApi } from "../../../api/nominaApi"; // Asegúrate de que la ruta sea correcta
import { setRegistrosNominaReports, updateNomina, checkingIsLoadingNominaSlice } from "./nominaCampoSlice"; // Importa de tu slice renombrado
import { setDepartamentos, setActividades, setRegistrosDepartamentos } from "./selNominaSlice"; // Importa el slice de selección si es necesario
import { modNomina } from "../../../sqlserver/nomina"; // Asegúrate de que la ruta sea correcta

export const getNominaCampo = (filter) => {
    // console.log("Filter RT 2:", filter); // Para depuración, puedes eliminarlo después
    // return
    return async(dispatch) => {
        const { data } = await nominaApi.post(`/ListNominaCampo/${filter.startDate}/${filter.endDate}/${filter.departamento}/${filter.actividad}`);
        dispatch( setRegistrosNominaReports({ reports: data.response }) );
    }
}

export const getDepartamentos = () => {
    return async(dispatch) => {
        const { data } = await nominaApi.get('/TotalDepartamentos');
        dispatch( setDepartamentos({ departamentos: data.response }) );
    }
}

export const getActividades = () => {
    return async(dispatch) => {
        const { data } = await nominaApi.get('/TotalActividades');
        dispatch( setActividades({ actividades: data.response }) );
    }
}

export const getFilterDepartamentos = (filter) => {
    // console.log("Filter para cargar departamentos:", filter);
    // return
    return async(dispatch) => {
        const { data } = await nominaApi.get(`/listDepartamentos/${filter.temporada}/${filter.departamento}`);
        dispatch( setRegistrosDepartamentos({ filterDep: data.response }) );
    }
}

//Modificar Nomina
export const iniciaUpdateNomina = (nomina) => {
    // console.log("Nomina a modificar:", nomina); // Para depuración, puedes eliminarlo después
    // return   
    return async(dispatch) => {
        dispatch(checkingIsLoadingNominaSlice());

        const result = await modNomina(nomina);

        if (!result.ok) {
            dispatch({ 
                type: 'UPDATE_ROUTE_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        } 

        // Despacha la acción con los datos actualizados
        dispatch(updateNomina({nomina}));
        return true;
    };
};