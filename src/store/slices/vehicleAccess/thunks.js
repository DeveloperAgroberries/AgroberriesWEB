import { vehicleAccessApi } from "../../../api/vehicleAccessApi";
import { setVehicleAccessReports } from "./vehicleAccessSlice";

export const getVehicleAccessRecords = (filterRAV) => {
	return async( dispatch ) => {
		const { data } = await vehicleAccessApi.get(`/ListIncome/${filterRAV.startDate}/${filterRAV.endDate}`);
		dispatch( setVehicleAccessReports({ reports: data.response }) );
	}
}