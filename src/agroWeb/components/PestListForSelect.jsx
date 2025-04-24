import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPests } from "../../store/slices/phytosanitary/thunks";

export const PestListForSelect = () => {
    const dispatch = useDispatch();
    const { pests = [] } = useSelector((state) => state.phytosanitary);
    
    useEffect(() =>{
        dispatch( getPests() );
    },[])

    return (
        <>
            {
                pests.map( pest =>(
                    <option value={pest.cCodigoPla} key={pest.cCodigoPla}>{pest.vNombrePla}</option>
                ))
            }   
        </>
    )
}
