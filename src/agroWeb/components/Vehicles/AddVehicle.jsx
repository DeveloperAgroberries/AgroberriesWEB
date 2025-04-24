import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { useForm } from '../../../hooks';
import { ProvidersListForSelect } from '../ProviderListForSelect';
import { startAddNewVehicle } from '../../../store/slices/vehicles';
import dayjs from 'dayjs';
import '../../../css/Popup.css';

	//TODO: Se tiene que agregar un modo de observar si hay una falla en el registrado de algun vehiculo por medio de una alerta

export const AddVehicle = ({ onClose }) => {

	const dispatch = useDispatch();
	const {user} = useContext(AuthContext);
	const [ errorMessage, setErrorMessage ] = useState('');
	const date = new Date()
	
	const checkSpecialCharForPlate =(e)=>{
		if(!/[0-9a-zA-Z ]/.test(e.key)){
			e.preventDefault();
		}
	};

	const checkChar =(e)=>{
		if(!/[0-9A-Z]/.test(e.key)){
			e.preventDefault();
		}
	};

	const onPaste = (e) => {
		e.preventDefault();
	}

	const {plate, capacity, vehicleType, provider, onInputChange} = useForm({
		plate: '',
		capacity: '',
		vehicleType: '',
		provider: ''
	});

	const onSubmit = async ( event ) =>{
		event.preventDefault();

		if(plate === '' || capacity === '' || vehicleType === '' || provider === ''){
			setErrorMessage("Revisa que los campos contengan datos");
			return;
		}else{
			const vehicle = {
				cPlacaVeh: plate.toUpperCase(),
				cActivoVeh: "1",
				cCapacidadVeh: capacity,
				vTipoVeh: vehicleType.toUpperCase(),
				cControlPrv: provider,
				cCodigoUsu: user?.id,
				dCreacionVeh: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
			}

			setErrorMessage('');
			const success = await dispatch( startAddNewVehicle(vehicle) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al agregar el vehiculo.Intente nuevamente');
			}
		}
	}

	return (
		<div className="popup-container">
			<div className="rounded-4 popup">
				<h2>Agregar Vehiculo</h2>
				<div className='container'>
					<form>
						<div className="mb-3">
							<label className="form-label">Placas</label>
							<input required type="text" className="form-control" aria-describedby="emailHelp" name='plate' value={ plate } onChange={ onInputChange } onKeyDown={(e)=>checkSpecialCharForPlate(e)} onPaste={onPaste}/>
							<div className="form-text">Evitar el caracter "-" al ingresar las placas del vehiculo.</div>
						</div>

						<div className="mb-3">
							<label className="form-label">Capacidad</label>
							<input required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='capacity' value={ capacity } onChange={ onInputChange } onKeyDown={(e)=>checkChar(e)} onPaste={onPaste} />
						</div>
						
						<div className="mb-3">
							<label className="form-label">Tipo De vehiculo</label>
							<select required className="form-select" name='vehicleType' value={ vehicleType } onChange={ onInputChange }>
								<option hidden value="">Seleccion</option>
								<option>CAMION</option>
								<option>URBAN</option>
								<option>PECERA</option>
							</select>
						</div>
						
						<div className="mb-3">
							<label className="form-label">Proveedor</label>
							<select required className="form-select" name='provider' value={ provider } onChange={ onInputChange }>
								<option hidden value="">Seleccion</option>
								<ProvidersListForSelect/>
							</select>
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
