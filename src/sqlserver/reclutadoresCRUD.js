import { reclutadoresAppApi } from "../api/reclutadoresApp";

export const marcarPagadoCandidatos = async (ids = []) => {
  try {
    const resp = await reclutadoresAppApi.put("/ActualizarEstatusPago", ids);
    return { ok: true, data: resp.data.response || [] };
  } catch (error) {
    return { ok: false, errorMessage: error.message };
  }
};

/**
* Actualiza los códigos de nómina (Personal y Actividad) de un candidato.
 * @param {number} id - El iIdcandidato a actualizar.
 * @param {object} datos - Objeto conteniendo { cCodigoTra, cCodigoAct }.
 */
export const actualizarCodigosNomina = async (id, datos) => {
  try {
    // Al usar [FromQuery], mandamos los datos en el objeto params
    const resp = await reclutadoresAppApi.put("/ActualizarDatosNomina", null, {
      params: {
        iIdcandidato: id,
        cCodigoTra: datos.cCodigoTra,
        cCodigoAct: datos.cCodigoAct
      }
    });

    return { ok: true, data: resp.data };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error.response?.data?.mensaje || error.message
    };
  }
};