import { CoolerTrackAppApi } from "../api/coolerApi";

//INSERTAR SOLICITUD DE CAJAS
export const agregarSolicitudCajas = {
    guardar: async (datos) => {
        try {
            const { data } = await CoolerTrackAppApi.post('/GuardarSolicitudCajas', datos);
            return data.mensaje === "Ok";
        } catch (error) {
            console.error("Error en API:", error);
            return false; // Retorna false para que el thunk sepa que hubo un fallo
        }
    },

    // NUEVO MÉTODO: Consultar solicitudes de cajas creadas para el día de hoy
    getSolicitudesHoy: async () => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetSolicitudesCajasHoy');
            return data.mensaje === "Ok" ? data.response : [];
        } catch (error) {
            console.error("Error al obtener solicitudes de hoy:", error);
            return [];
        }
    },

    // NUEVO MÉTODO: Actualizar una solicitud existente mediante su ID
    actualizar: async (id, datosActualizados) => {
        try {
            const { data } = await CoolerTrackAppApi.put(`/UpdateSolicitudCaja/${id}`, datosActualizados);
            return data.mensaje === "Solicitud actualizada correctamente" || data.response === true;
        } catch (error) {
            console.error(`Error al actualizar la solicitud con ID ${id}:`, error);
            return false;
        }
    },

    // Nuevos métodos para los catálogos
    getCoolers: async () => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetCoolers');
            return data.mensaje === "Ok" ? data.response : [];
        } catch (error) {
            console.error("Error al obtener coolers:", error);
            return [];
        }
    },

    getTamanios: async () => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetTamanios');
            return data.mensaje === "Ok" ? data.response : [];
        } catch (error) {
            console.error("Error al obtener tamaños:", error);
            return [];
        }
    },

    getCamposSectores: async () => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetCamposSectores');
            if (data.mensaje !== "Ok") return [];

            const items = Object.values(data.response);

            // Filtramos para que solo quede un registro por cCodigoCam
            const unicos = [...new Map(items.map(item => [item.cCodigoCam, item])).values()];

            return unicos;
        } catch (error) {
            console.error("Error al obtener campos:", error);
            return [];
        }

    },

    getSKUs: async () => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetSKU');
            return data.mensaje === "Ok" ? data.response : [];
        } catch (error) {
            console.error("Error al obtener SKUs:", error);
            return [];
        }
    }
};