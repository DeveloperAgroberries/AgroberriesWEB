import { usersApi } from "../../../api/usersApi";
import { setUsers } from "./userSlice";

export const getUsers = () => {
    return async(dispatch) => {
        const { data } = await usersApi.get('/ListLogins');
        dispatch( setUsers({ users: data.response }) );
    }
}
