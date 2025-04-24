import { transportRecordsApi } from "../../../api/transportRecordsApi";
import { checkingIsLoadingReportSlice, setReports, updateTransportRecords } from "./editingTransportRecordsSlice";
import { setRegistrosTransporteReports } from "./registrosTransporteSlice";
import { setBaseReports } from "./reporteBaseSlice";
import { setTransportAnalysisReports } from "./transportAnalysisSlice";


export const getDataTransportRecordsByDateForAT = (filter) => {
    return async(dispatch) => {
        const { data } = await transportRecordsApi.get(`/ObtainRecordsByDate/${filter.startDate}/${filter.endDate}`);
        dispatch( setTransportAnalysisReports({ reports: data.response }) );
    }
}

export const getDataTransportRecordsByDateForRT = (filter) => {
    return async(dispatch) => {
        const { data } = await transportRecordsApi.get(`/ObtainRecordsByDate/${filter.startDate}/${filter.endDate}`);
        dispatch( setRegistrosTransporteReports({ reports: data.response }) );
    }
}

export const getDataTransportRecordsByDateForBT = (filter) => {
    return async(dispatch) => {
        const { data } = await transportRecordsApi.get(`/ObtainRecordsByDate/${filter.startDate}/${filter.endDate}`);
        dispatch( setBaseReports({ reports: data.response }) );
    }
}

export const getDataTransportRecordsByDateAndRoute = (filterERP) => {
    return async(dispatch) => {
        const { data } = await transportRecordsApi.get(`/ObtainRecordsByDateAndRoute/${filterERP.dateERP}/${filterERP.dateERP}/${filterERP.routeERP}`);
        dispatch( setReports({ reports: data.response }) );
    }
}

export const startUpdateTransportRecords = (editingTransportRecords) => {
    return async(dispatch) => {
        dispatch(checkingIsLoadingReportSlice());

        const result = await transportRecordsApi.patch('/EditTransportRecords', editingTransportRecords);

        if (result.status != 200) {
            dispatch({ 
                type: 'UPDATE_TRANSPORT_RECORDS_ERROR', 
                payload: result.errorMessage 
            });
            return false;
        } 

        // Despacha la acción con los datos actualizados
        dispatch(updateTransportRecords({editingTransportRecords}));
        return true;
    };
}; 