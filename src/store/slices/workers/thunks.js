import { workersApi } from "../../../api/workersApi";
import { setWorkers } from "./workerSlice";

export const getWorkers = () => {
	return async (dispatch) => {
		const { data} = await workersApi.get('/ListWorkers');
		dispatch( setWorkers({ workers: data.response}) )
	}
}
