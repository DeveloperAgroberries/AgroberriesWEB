import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { ProvidersListForSelect } from '../ProviderListForSelect';
import { getProviders } from '../../../store/slices/vehicleProviders';
import { AuthContext } from '../../../auth/context/AuthContext';
import { startUpdateVehicles } from '../../../store/slices/vehicles';
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';
import '../../../css/Popup.css';

export const ModVehicle = ({ onClose }) => {

	const dispatch = useDispatch();
	const {user} = useContext(AuthContext);
	const { selVehicles = []} = useSelector( (state) => state.selVehicles );
	const [ errorMessage, setErrorMessage] = useState('');
	const {providers =[]} = useSelector( (state) => state.providers );
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

	useEffect(() =>{
		dispatch( getProviders() );
	  },[dispatch])

	const {plate, active, capacity, vehicleType, provider, onInputChange} = useForm({
		plate: selVehicles.cPlacaVeh || '',
		active: selVehicles.cActivoVeh || '',
		capacity: selVehicles.cCapacidadVeh || '',
		vehicleType: selVehicles.vTipoVeh || '',
		provider: parseInt(selVehicles.cControlPrv),
	});

	const handleInputChange = (event) => {
		const { name, value, type, checked } = event.target;
	
		// Si es un checkbox, usamos el valor 'checked', de lo contrario, usamos 'value'
		const updatedValue = type === 'checkbox' ? checked : value;

		// Actualizar el estado del formulario
		onInputChange({
			target: {
				name,
				value: updatedValue,
			},
		});
	};

	const onSubmit = async( event ) =>{
		event.preventDefault();

		if(plate === '' || capacity === '' || vehicleType === '' || provider === ''){
			setErrorMessage('Por favor, revisa los campos');
			return;
		}else{
			const vehicle = {
				cControlVeh: selVehicles.cControlVeh,
				cPlacaVeh: plate.toUpperCase(),
				cActivoVeh: active ? '1' : '0',
				cCapacidadVeh: capacity,
				vTipoVeh: vehicleType.toUpperCase(),
				cControlPrv: parseInt(provider),
				cCodigoUsu: selVehicles.cCodigoUsu,
				cUsumodVeh: user?.id,
				dModifiVeh: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
			}

			setErrorMessage('');
			const success = await dispatch( startUpdateVehicles(vehicle) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al actualizar la ruta. Intente nuevamente.');
			}
		}
	}

	return (
		<div className="popup-container">
			<div className="rounded-4 popup">
				<h2>Modificar Vehiculo</h2>
				<div className='container'>
					<form>
						<div className="mb-3">
							<label className="form-label">Placas</label>
							<input required type="text" className="form-control" aria-describedby="emailHelp" name='plate' value={ plate } onChange={ onInputChange } onKeyDown={(e)=>checkSpecialCharForPlate(e)} onPaste={onPaste}/>
							<div className="form-text">Evitar el caracter "-" al ingresar las placas del vehiculo.</div>
						</div>
						
						<div className="mb-3">
							<label className="form-label">Capacidad</label>
							<input required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='capacity' value={ capacity } onChange={ onInputChange } onKeyDown={(e)=>checkChar(e)} onPaste={onPaste}/>
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
								
									{/* The load proces is not sincronized with the data showed in the moment of the view is renderized
									<ProvidersListForSelect/> */}
								
								
								{
									providers.map( provider =>(
									<option value={parseInt(provider.cControlPrv)} key={parseInt(provider.cControlPrv)}>{provider.vNombrePrv}</option>
									))
      							}   
							</select>
						</div>
						<div className="form-check form-switch">
							<input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" name="active" checked={ active } onChange={ handleInputChange }/>
							<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Activa</label>
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
