import { activosApi } from "../../../api/combustiblesApi";
import { addActivoF } from "../../../sqlserver/activosF";
import {
    checkingIsLoading,
    setActivos,
    setError,
    checkingIsLoadingSubfamilias,
    setSubFamilias,
    setErrorSubFamilias,
    checkingIsLoadingCode,
    setCodeData,
    setErrorCode,
    checkingIsLoadingProveedores,
    setProveedores,
    setErrorProveedores,
    checkingIsLoadingEmpresas,
    setEmpresas,
    setErrorEmpresas,
    checkingIsLoadingDepartamentos,
    setDepartamentos,
    setErrorDepartamentos,
    // Importa las nuevas acciones para lotes y actividades fijas
    checkingIsLoadingActividadesFijas,
    setActividadesFijas,
    setErrorActividadesFijas,
    checkingIsLoadingLotesActivos,
    setLotesActivos,
    setErrorLotesActivos,
    addNewActivoFijo,
    setCamposActivos,
    setErrorCamposActivos
} from './combustiblesSlice';




export const getActivos = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoading()); // Marca que está cargando
        // console.log("Cargando...");

        try {
            const { data } = await activosApi.get('/ListActivosF');
            // console.log("Datos recibidos:", data);  // Verifica si los datos son correctos

            // Despacha la acción con los datos correctos
            if (data && data.response) {
                dispatch(setActivos({ activos: data.response })); // Usa data.response
            } else {
                dispatch(setError("No se recibieron datos de activos")); // Si no hay datos, muestra un error
            }
        } catch (error) {
            // console.error("Error al cargar los datos:", error);
            dispatch(setError(error.errorMessage || 'Error desconocido')); // Si hay un error, se despacha el error
        }
    };
};

export const getSubFamilias = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingSubfamilias()); // Marca que la carga de subfamilias ha comenzado

        try {
            const { data } = await activosApi.get('/subfamilias');
            // console.log("Datos recibidos:", data);

            if (data && data.response) {
                dispatch(setSubFamilias(data.response)); // Despacha la acción setSubFamilias con los datos
            } else {
                dispatch(setErrorSubFamilias("No se recibieron datos de subfamilias")); // Si no hay datos, muestra un error específico de subfamilias
            }
        } catch (error) {
            console.error("Error al cargar las subfamilias:", error);
            dispatch(setErrorSubFamilias(error.message || 'Error desconocido al cargar subfamilias')); // Despacha el error específico de subfamilias
        }
    };
};

export const getCode = (codigoAff) => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingCode()); // Marca que la carga del código ha comenzado

        try {
            const { data } = await activosApi.get(`/findCodeAF/${codigoAff}`);

            if (data && data.response) {
                dispatch(setCodeData(data.response)); // Despacha la acción con los datos del código
            } else {
                dispatch(setErrorCode("No se recibieron datos para el código especificado")); // Error específico del código
            }
        } catch (error) {
            console.error(`Error al cargar datos para el código ${codigoAff}:`, error);
            dispatch(setErrorCode(error.message || `Error desconocido al cargar datos para el código ${codigoAff}`)); // Error específico del código
        }
    };
};

export const getProveedor = (nombreP) => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingProveedores()); // Usa la nueva acción de carga

        try {
            const { data } = await activosApi.get(`/findProveedor/${nombreP}`);

            if (data && data.response) {
                dispatch(setProveedores(data.response)); // Usa la nueva acción de datos
            } else {
                dispatch(setErrorProveedores("No se recibieron datos del proveedor")); // Usa la nueva acción de error
            }
        } catch (error) {
            console.error(`Error al cargar datos del proveedor ${nombreP}:`, error);
            dispatch(setErrorProveedores(error.message || `Error desconocido al cargar datos del proveedor ${nombreP}`)); // Usa la nueva acción de error
        }
    };
};

// Acción asíncrona para obtener la lista de empresas
export const getEmpresas = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingEmpresas()); // Marca que la carga de empresas ha comenzado

        try {
            const { data } = await activosApi.get('/empresas'); // Reemplaza '/empresas' con tu endpoint real
            if (data && data.response) {
                dispatch(setEmpresas(data.response)); // Despacha la acción con los datos de las empresas
            } else {
                dispatch(setErrorEmpresas("No se recibieron datos de empresas")); // Error específico de empresas
            }
        } catch (error) {
            console.error("Error al cargar las empresas:", error);
            dispatch(setErrorEmpresas(error.message || 'Error desconocido al cargar empresas')); // Despacha el error específico de empresas
        }
    };
};

// Acción asíncrona para obtener la lista de departamentos
export const getDepartamentos = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingDepartamentos()); // Marca que la carga de departamentos ha comenzado

        try {
            const { data } = await activosApi.get('/departamentos'); // Reemplaza '/departamentos' con tu endpoint real
            if (data && data.response) {
                dispatch(setDepartamentos(data.response)); // Despacha la acción con los datos de los departamentos
            } else {
                dispatch(setErrorDepartamentos("No se recibieron datos de departamentos")); // Error específico de departamentos
            }
        } catch (error) {
            console.error("Error al cargar los departamentos:", error);
            dispatch(setErrorDepartamentos(error.message || 'Error desconocido al cargar departamentos')); // Despacha el error específico de departamentos
        }
    };
};

// Thunk para obtener la lista de actividades fijas activas
export const getActividadesFijasActivas = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingActividadesFijas()); // Marca que la carga de actividades fijas ha comenzado

        try {
            const { data } = await activosApi.get('/listActividades'); // Reemplaza '/activos-fijos-activos' con tu endpoint real
            if (data && data.response) {
                dispatch(setActividadesFijas(data.response)); // Despacha la acción con los datos de las actividades fijas
            } else {
                dispatch(setErrorActividadesFijas("No se recibieron datos de actividades fijas")); // Error específico de actividades fijas
            }
        } catch (error) {
            console.error("Error al cargar las actividades fijas:", error);
            dispatch(setErrorActividadesFijas(error.message || 'Error desconocido al cargar actividades fijas')); // Despacha el error específico de actividades fijas
        }
    };
};

// Thunk para obtener la lista de lotes activos (sin el parámetro de código de lote)
export const getLotesActivos = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingLotesActivos()); // Marca que la carga de lotes activos ha comenzado

        try {
            const { data } = await activosApi.get('lotesActivos/'); // Reemplaza '/lotes-activos-cultivos-temporadas-activas' con tu endpoint real
            if (data && data.response) {
                dispatch(setLotesActivos(data.response)); // Despacha la acción con los datos de los lotes activos
            } else {
                dispatch(setErrorLotesActivos("No se recibieron datos de lotes activos")); // Error específico de lotes activos
            }
        } catch (error) {
            console.error("Error al cargar los lotes activos:", error);
            dispatch(setErrorLotesActivos(error.message || `Error desconocido al cargar lotes activos ${nombreLote}`)); // Despacha el error específico de lotes activos
        }
    };
};

//Campos
export const getCamposActivos = () => {
    return async (dispatch) => {
        dispatch(checkingIsLoadingActividadesFijas()); // Marca que la carga de actividades fijas ha comenzado

        try {
            const { data } = await activosApi.get('/listCampos'); // Reemplaza '/activos-fijos-activos' con tu endpoint real
            if (data && data.response) {
                dispatch(setCamposActivos(data.response)); // Despacha la acción con los datos de las actividades fijas
            } else {
                dispatch(setErrorCamposActivos("No se recibieron datos de campos")); // Error específico de actividades fijas
            }
        } catch (error) {
            console.error("Error al cargar las actividades fijas:", error);
            dispatch(setErrorCamposActivos(error.message || 'Error desconocido al cargar campos')); // Despacha el error específico de actividades fijas
        }
    };
};

//CRUD
export const startAddNewActivoFijo = (afData) => {
    return async (dispatch) => {
      dispatch(checkingIsLoading());
  
      try {
        // 1. Realizar la petición para obtener el código
        const codigoResult = await activosApi.get('/findCodigoAF');
        const codigoStr = codigoResult.data.response[0].cCodigoAfi.trim();
        const prefix = codigoStr.slice(0, -5);
        const numericPartStr = codigoStr.slice(-5);
        const numericPart = parseInt(numericPartStr, 10);
        const incrementedNumericPart = numericPart + 1;
        const incrementedNumericPartStr = String(incrementedNumericPart).padStart(5, '0');
  
        const nuevoCodigoAfi = prefix + incrementedNumericPartStr;
        // console.log('Nuevo código:', nuevoCodigoAfi);
  
        // 2. Incluir el código en afData
        const afDataConCodigo = {
          ...afData,
          cCodigoAfi: nuevoCodigoAfi,
        };
  
        // console.log('afData con código:', afDataConCodigo);

        // 3. Llamar a la función para agregar el activo fijo CON el código
        const result = await addActivoF(afDataConCodigo);
  
        if (!result.ok) {
          dispatch({
            type: 'ADD_AF_ERROR',
            payload: result.errorMessage
          });
          return false;
        }
  
        dispatch(addNewActivoFijo({ afData: afDataConCodigo }));
        return true;
  
      } catch (error) {
        console.error('Error al obtener el código:', error);
        dispatch({
          type: 'FETCH_CODIGO_ERROR',
          payload: error.response?.data?.mensaje || 'Error al obtener el código.',
        });
        return false;
      }
    };
  };

//Guardar PDF en el servidor
export const uploadPDF = (formData) => {
    return async (dispatch) => { // Recibe dispatch y formData como argumento
        try {
            const uploadResponse = await activosApi.post('/upload', formData, { // Endpoint para subir el archivo
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (uploadResponse.status === 200) {
                console.log(uploadResponse.data?.filename);
                return { success: true, ruta: uploadResponse.data?.filename }; // Devuelve un objeto con la ruta
            } else {
                console.error('Error al subir el archivo:', uploadResponse);
                dispatch({
                    type: 'ADD_AF_ERROR',
                    payload: 'Error al subir el archivo.'
                });
                return { success: false, error: 'Error al subir el archivo.' }; // Devuelve un objeto de error
            }
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            dispatch({
                type: 'ADD_AF_ERROR',
                payload: 'Error al subir el archivo.'
            });
            return { success: false, error: 'Error al subir el archivo.' }; // Devuelve un objeto de error
        }
    };
};