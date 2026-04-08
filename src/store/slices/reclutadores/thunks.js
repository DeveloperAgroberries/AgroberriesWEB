import { setCandidatos, setChecking, setListaReclutadores } from "./reclutadoresSlice";
import { reclutadoresAppApi } from "../../../api/reclutadoresApp";
import { marcarPagadoCandidatos, actualizarCodigosNomina } from "../../../sqlserver/reclutadoresCRUD";


// 1. CARGA INICIAL (La que te faltaba)
export const startLoadingCandidatos = () => {
    return async (dispatch) => {
        dispatch(setChecking());
        try {
            const { data } = await reclutadoresAppApi.get('/ConsultarCandidatos');
            if (data && data.response) {
                dispatch(setCandidatos(data.result || []));
            }
        } catch (error) {
            console.error("Error cargando candidatos", error);
            dispatch(setCandidatos([]));
        }
    }
}

// 2. CARGA DE LA LISTA PARA EL SELECT
export const startLoadingReclutadores = () => {
    return async (dispatch) => {
        try {
            const { data } = await reclutadoresAppApi.get('/ListReclutadores');
            // Según tu JSON, los datos vienen en data.response
            if (data && data.response) {
                dispatch(setListaReclutadores(data.response)); 
            }
        } catch (error) {
            console.error("Error cargando lista de reclutadores", error);
        }
    }
}

// 3. BÚSQUEDA CON FILTRO
export const startSearchCandidatos = ( reclutadorString ) => {
    return async (dispatch) => {
        dispatch(setChecking());
        try {
            // Usamos params para evitar errores de carácteres especiales (CORS)
            const resp = await reclutadoresAppApi.get('/ConsultarCandidatos', {
                params: {
                    vNomreclutador: reclutadorString
                }
            });

            // Ajustamos según la estructura de tu respuesta de C#
            const dataResult = resp.data.response || resp.data.result || [];
            dispatch(setCandidatos(dataResult));

        } catch (error) {
            console.error("Error en la búsqueda:", error);
            dispatch(setCandidatos([]));
        }
    }
}

export const startUpdatePagoCandidatos = (ids = [], reclutadorString = '') => async (dispatch) => {
  dispatch(setChecking());
  try {
    const result = await marcarPagadoCandidatos(ids);

    if (result.ok) {
      if (reclutadorString) {
        await dispatch(startSearchCandidatos(reclutadorString));
      } else {
        dispatch(setCandidatos(result.data || []));
      }
    } else {
      console.error(result.errorMessage);
    }

    return result;
  } catch (error) {
    console.error('Error en startUpdatePagoCandidatos:', error);
    dispatch(setCandidatos([])); // dependiento de tu flujo
    return { ok: false, error: error.message };
  }
};

export const startSaveNominaCodes = (id, codigos, reclutadorActual = '') => {
    return async (dispatch) => {
        // Mostramos el estado de carga (si lo usas)
        dispatch(setChecking());
        
        const result = await actualizarCodigosNomina(id, codigos);

        if (result.ok) {
            // Refrescamos la lista basándonos en el filtro actual
            if (reclutadorActual) {
                dispatch(startSearchCandidatos(reclutadorActual));
            } else {
                dispatch(startLoadingCandidatos());
            }
        }
        
        return result;
    }
}