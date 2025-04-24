import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { startUpdateProvider } from '../../../store/slices/vehicleProviders';
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';
import '../../../css/Popup.css';


export const ModProvider = ({ onClose }) => {

	const dispatch = useDispatch();
	const {user} = useContext(AuthContext);
	const { selProviders = []} = useSelector( (state) => state.selProviders );
	const [ errorMessage, setErrorMessage] = useState('');
	const date = new Date();

	const checkSpecialCharForProvider =(e)=>{
		if(!/[0-9a-zA-Z ]/.test(e.key)){
			e.preventDefault();
		}
	};

	const onPaste = (e) => {
		e.preventDefault();
	}

	const {providerName, onInputChange} = useForm({
		providerName: selProviders.vNombrePrv,
	});

	const onSubmit = async ( event ) =>{
		event.preventDefault();

		if(providerName === ''){
			setErrorMessage('Por favor, revisa los campos.');
			return;
		}else{
			const provider = {
				cControlPrv: selProviders.cControlPrv,
				vNombrePrv: providerName.toUpperCase().trim(),
				cCodigoUsu: selProviders.cCodigoUsu,
				cUsumodPrv: user?.id,
				dModifiPrv: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
			}

			setErrorMessage('');
			const success = await dispatch( startUpdateProvider(provider) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al actualizar el proveedor/ Intenta nuevamente.');
			}
		}
	}

	return (
		<div className="popup-container">
			<div className="rounded-4 popup">
				<h2>Modificar Proveedor</h2>
				<div className='container'>
					<form>
						<div className="mb-3">
							<label className="form-label">Nombre proveedor</label>
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
					<button className='btn btn-outline-success rounded-2 m-1' onClick={ onSubmit }>Guardar</button>
					<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
				</div>
				
			</div>
		</div>
	);
};
