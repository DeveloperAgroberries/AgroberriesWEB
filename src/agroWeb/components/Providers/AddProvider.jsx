import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { startAddNewProvider } from '../../../store/slices/vehicleProviders';
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';
import '../../../css/Popup.css';

export const AddProvider = ({ onClose }) => {

	const dispatch = useDispatch();
	const {user} = useContext(AuthContext);
	const [ errorMessage, setErrorMessage] = useState('');
	const date = new Date()
	
	const checkSpecialCharForProvider =(e)=>{
		if(!/[0-9a-zA-Z ]/.test(e.key)){
		e.preventDefault();
		}
	};

	const onPaste = (e) => {
		e.preventDefault();
	}

	const { providerName, onInputChange} = useForm({
		providerName: '',
	});

	const onSubmit = async ( event ) =>{
		event.preventDefault();

		if(providerName === ''){
			setErrorMessage('Revisa que los campos contengan datos');
			return;
		}else{
			const provider = {
				vNombrePrv: providerName.toUpperCase().trim(),
				cCodigoUsu: user?.id,
				dCreacionPrv: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
			}

			setErrorMessage('');
			const success = await dispatch( startAddNewProvider(provider) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al agregar el proveedor. Intente nuevamente.');
			}
		}
	}

	return (
		<div className="popup-container">
		<div className="rounded-4 popup">
			<h2>Agregar Proveedor</h2>
			<div className='container'>
			<form>
				<div className="mb-3">
				<label className="form-label">Nombre del proveedor</label>
				<input required type="text" className="form-control" aria-describedby="emailHelp" name='providerName' value={ providerName } onChange={ onInputChange } onKeyDown={(e)=>checkSpecialCharForProvider(e)} onPaste={onPaste}/>
				</div>
			</form>
			</div>

			{errorMessage && (
				<div className="alert alert-danger" role="alert">
					{errorMessage}
				</div>
        	)}
			
			<div className='container mb-1 mt-2'>
			<button className='btn btn-outline-success rounded-2 m-1'  onClick={ onSubmit }>Guardar</button>
			<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
			</div>
			
		</div>
		</div>
	);
};
