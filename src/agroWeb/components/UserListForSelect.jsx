import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIndustrialDinnerUsers } from "../../store/slices/diningRoom/thunks";

export const UserListForSelect = () => {
    const dispatch = useDispatch();
    const { industrialDinnerUsers = [] } = useSelector((state) => state.diningRoom); 
    
    useEffect(() =>{
        dispatch( getIndustrialDinnerUsers() );
    },[])

    return (
        <>
            {
                industrialDinnerUsers.map( user =>(
                    <option value={user.cCodigoUsu} key={user.cCodigoUsu}>{user.cCodigoUsu}</option>
                ))
            }   
        </>
    )
}
