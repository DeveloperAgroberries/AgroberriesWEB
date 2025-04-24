import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFields } from "../../store/slices/fields/thunks";

export const RanchListForSelect = () => {
    const dispatch = useDispatch();
    const { fields = [] } = useSelector((state) => state.fields);
    
    useEffect(() =>{
        dispatch( getFields() );
    },[])

    const noInfunctionalFiledsAdd = fields.filter((item) => {
		// Eliminar elementos donde dCapturaFit está vacío o es null
		return item.cCodigoCam.trim() !== null && item.cCodigoCam.trim() !== '' && item.cActivoCam.trim() !== '0' && item.cCodigoCam.trim() !== '0011' 
        && item.cCodigoCam.trim() !== '0012' && item.cCodigoCam.trim() !== '0017' && item.cCodigoCam.trim() !== '0019' && item.cCodigoCam.trim() !== '0032'
        && item.cCodigoCam.trim() !== '0046' && item.cCodigoCam.trim() !== '0047' && item.cCodigoCam.trim() !== '0050' && item.cCodigoCam.trim() !== '0052'
        && item.cCodigoCam.trim() !== '0053' && item.cCodigoCam.trim() !== '0054' && item.cCodigoCam.trim() !== '0055' && item.cCodigoCam.trim() !== '0056'
        && item.cCodigoCam.trim() !== '0057' && item.cCodigoCam.trim() !== '0058' && item.cCodigoCam.trim() !== '0059' && item.cCodigoCam.trim() !== '0061'
        && item.cCodigoCam.trim() !== '0062' && item.cCodigoCam.trim() !== '0063' && item.cCodigoCam.trim() !== '0064' && item.cCodigoCam.trim() !== '0066';
	});

    return (
        <>
            {
                noInfunctionalFiledsAdd.map( field =>(
                    <option value={field.cCodigoCam} key={field.cCodigoCam}>{field.vNombreCam}</option>
                ))
            }   
        </>
    )
}
