import { CoolerTrackAppApi } from "../../../api/coolerApi"; // Ajusta la ruta a tu api
import { setEnvios, setLoading, setCoolers } from "./enviosCoolerSlice";

// 🚩 Nuevo: Cargar catálogo de coolers para el select
export const startLoadingCoolers = () => {
    return async (dispatch) => {
        try {
            const { data } = await CoolerTrackAppApi.get('/GetCoolers');
            if (data.mensaje === "Ok") {
                dispatch(setCoolers(data.response));
            }
        } catch (error) {
            console.error("Error cargando catálogo de coolers:", error);
        }
    };
};

// Cargar envíos por código de cooler
export const startLoadingEnvios = (codCooler) => {
    return async (dispatch) => {
        if (!codCooler) return;
        dispatch(setLoading());
        try {
            const { data } = await CoolerTrackAppApi.get(`/GetMonitorCooler/${codCooler}`);
            if (data.mensaje === "Ok") {
                dispatch(setEnvios(data.response));
            }
        } catch (error) {
            console.error("Error cargando envíos:", error);
            dispatch(setEnvios([]));
        }
    };
};