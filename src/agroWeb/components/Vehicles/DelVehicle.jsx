import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startDeleteVehicles } from '../../../store/slices/vehicles';
import { useForm } from '../../../hooks';
import '../../../css/Popup.css';

export const DelVehicle = ({ onClose }) => {

	const dispatch = useDispatch();
	const { selVehicles = []} = useSelector( (state) => state.selVehicles );
	const [ errorMessage, setErrorMessage ] = useState('');

	const {plate} = useForm({
		plate: selVehicles.cPlacaVeh,
	});

	const onSubmit = async ( event ) =>{
		event.preventDefault();

		if(plate === ''){
			setErrorMessage('Revisa que los campos contengan datos');
			return;
		}else{
			setErrorMessage('');
			const success = await dispatch( startDeleteVehicles(selVehicles.cControlVeh) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al eliminar la ruta. Intente nuevamente.')
			}
		}	
	}

	return (
		<div className="popup-container">
			<div className="rounded-4 popup">
				<h2>Eliminar Vehiculo</h2>
				<hr/>
				<div className='container'>
					<form>
						<div className="mb-3">
							<label className="form-label">Placas</label>
							<input disabled type="text" className="form-control" aria-describedby="emailHelp" name='plate' value={ plate } />
						</div>
					</form>
				</div>

				{errorMessage && (
					<div className="alert alert-danger" role="alert">
						{errorMessage}
					</div>
				)}	

				<h5>Desea eliminar este vehiculo?</h5>
				<div className='container mb-1 mt-2'>
					<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onSubmit }>Eliminar</button>
					<button className='btn btn-outline-warning rounded-2 m-1' onClick={ onClose }>Regresar</button>
				</div>
			</div>
		</div>
	);
};
