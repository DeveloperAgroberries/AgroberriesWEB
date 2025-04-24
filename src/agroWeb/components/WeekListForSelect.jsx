import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNomWeeks } from "../../store/slices/nomWeeks/thunks";


export const WeekListForSelect = () => {
	const dispatch = useDispatch();
    const { nomWeeks = [] } = useSelector((state) => state.nomWeeks);
    
    useEffect(() =>{
        const fetchData = async () => {
            await dispatch( getNomWeeks() );
        }
        fetchData()
    },[dispatch])

    return (
        <>
            {
                nomWeeks.map( week =>(
                    <option value={week.cCodigoSem} key={week.cCodigoSem}>{week.cCodigoSem}</option>
                ))
            }   
        </>
    )
}
