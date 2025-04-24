import { diningRoomApi } from "../../../api/diningRoomApi";
import { setDiningRoomRecords, setFieldByWorkerRecords, setIndustrialDinnerUsers } from "./diningRoomSlice";

export const getDiningRoomRecords = (filterRUAC) => {
	return async( dispatch ) => {
		const { data } = await diningRoomApi.get(`/ListFoodRecords/${filterRUAC.startDate}/${filterRUAC.endDate}`);
		dispatch( setDiningRoomRecords({ diningRoomRecords: data.response }) );
	}
}

export const getFieldByWorker = () => {
	return async( dispatch ) => {
		const { data } = await diningRoomApi.get(`/ListFieldByWorker`);
		dispatch( setFieldByWorkerRecords({ fieldByWorkerRecords: data.response }) );
	}
}

export const getIndustrialDinnerUsers = () => {
	return async( dispatch ) => {
		const { data } = await diningRoomApi.get(`/ListIndustrialDinnerUsers`);
		dispatch( setIndustrialDinnerUsers({ industrialDinnerUsers: data.response }) );
	}
}