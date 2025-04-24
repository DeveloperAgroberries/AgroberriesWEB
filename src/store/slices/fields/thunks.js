import { fieldsApi } from "../../../api/fieldsApi";
import { setFields } from "./fieldsSlice";

export const getFields = () => {
    return async(dispatch) => {
        const { data } = await fieldsApi.get('/ListFields');
        dispatch( setFields({ fields: data.response }) );
    }
}
