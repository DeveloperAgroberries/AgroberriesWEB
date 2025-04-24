
import { nomWeeksApi } from "../../../api/nomWeeksApi";
import { setNomWeeks } from "./nomWeekSlice";

export const getNomWeeks = () => {
    return async(dispatch) => {
        const { data } = await nomWeeksApi.get('/ListWeeks');
        dispatch( setNomWeeks({ nomWeeks: data.response }) );
    }
}