import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startSaveTransportRecord } from "../../../store/slices/routeComplement/thunks";
import { getDataTransportRecordsByDateForAT } from "../../../store/slices/reports";
import {setActiveRecord } from "../../../store/slices/reports/transportAnalysisSlice";
import '../../../css/Popup.css';

export const AddComplement = ({ onClose }) => {
	const dispatch = useDispatch();
	const { activeRecord = []} = useSelector( (state) => state.transportAnalysis );
	const { transportAnalysisFilters = [] } = useSelector((state) => state.transportAnalysis);
	const [ errorMessage, setErrorMessage] = useState('');

	const onSubmit = async( event ) =>{
		event.preventDefault();

		if( activeRecord.cControlRut === '' || activeRecord.cControlVeh === '' || activeRecord.nCostoRut === '' || activeRecord.length === 0 ){
			setErrorMessage('No haz seleccionado nada o la seleccion acutal no cuenta con alguno de los campos necesarios para realizar el complementado');
			return;
		}else{
			setErrorMessage('');
			console.log(activeRecord)
			const success = await dispatch( startSaveTransportRecord(activeRecord) );
			if(success){
				dispatch(getDataTransportRecordsByDateForAT(transportAnalysisFilters)); 
				onClose();
				dispatch ( setActiveRecord([]) )
			} else {
				setErrorMessage('Error al agregar el complemento. Intente nuevamente.');
			}
		}
	}

	return (
    	<div className="popup-container">
			<div className="rounded-4 text-center popup">
				<h2>Confirmar complemento para ruta</h2>
				
				{errorMessage && (
					<div className="alert alert-danger" role="alert">
						{errorMessage}
					</div>
				)}

				<div className='container mb-1 mt-2'>
					<button className='btn btn-outline-success rounded-2 m-1' onClick={ onSubmit }>Guardar</button>
					<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
				</div>
				
			</div>
		</div>
  	)
}
