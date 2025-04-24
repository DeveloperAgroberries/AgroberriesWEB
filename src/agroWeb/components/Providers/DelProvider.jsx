import { useDispatch, useSelector } from 'react-redux';
import { startDeleteProvider } from '../../../store/slices/vehicleProviders';
import { useForm } from '../../../hooks';
import '../../../css/Popup.css';
import { useState } from 'react';

export const DelProvider = ({ onClose }) => {

	const dispatch = useDispatch();
	const { selProviders = []} = useSelector( (state) => state.selProviders );
	const [ errorMessage, setErrorMessage ] = useState('');

	const {providerName} = useForm({
		providerName: selProviders.vNombrePrv,
	});

	const onSubmit = async ( event ) =>{
		event.preventDefault();
		if(providerName === ''){
			setErrorMessage('Revisa que los campos contengan datos.');
			return;
		}else{
			setErrorMessage('');
			const success = await dispatch( startDeleteProvider(selProviders.cControlPrv) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al eliminar el proveedor. Intente nuevamente.')
			}
		}
	}

	return (
		<div className="popup-container">
			<div className="rounded-4 popup">
				<h2>Eliminar Proveedor</h2>
				<hr/>
				<div className='container'>
					<form>
						<div className="mb-3">
							<label className="form-label">Nombre de proveedor</label>
							<input disabled type="text" className="form-control" aria-describedby="emailHelp" name='providerName' value={ providerName } />
						</div>
					</form>
				</div>

				{errorMessage && (
					<div className="alert alert-danger" role="alert">
						{errorMessage}
					</div>
				)}

				<h5>Desea eliminar este proveedor?</h5>
				<div className='container mb-1 mt-2'>
					<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onSubmit }>Eliminar</button>
					<button className='btn btn-outline-warning rounded-2 m-1' onClick={ onClose }>Regresar</button>
				</div>
				
			</div>
		</div>
	);
};
