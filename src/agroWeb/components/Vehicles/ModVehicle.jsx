import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviders } from '../../../store/slices/vehicleProviders';
import { AuthContext } from '../../../auth/context/AuthContext';
import { startUpdateVehicles } from '../../../store/slices/vehicles';
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';
import '../../../css/Popup.css';

export const ModVehicle = ({ onClose, vehicleData }) => { // 👈 Recibe data por props
	const dispatch = useDispatch();
	const { user } = useContext(AuthContext);
	const [errorMessage, setErrorMessage] = useState('');
	const { providers = [] } = useSelector((state) => state.providers);

	useEffect(() => {
		dispatch(getProviders());
	}, [dispatch]);

	// Usamos vehicleData para inicializar el formulario
	const { plate, active, capacity, vehicleType, provider, onInputChange } = useForm({
		plate: vehicleData?.cPlacaVeh || '',
		active: vehicleData?.cActivoVeh || false,
		capacity: vehicleData?.cCapacidadVeh || '',
		vehicleType: vehicleData?.vTipoVeh || '',
		provider: parseInt(vehicleData?.cControlPrv) || '',
	});

	const handleInputChange = (event) => {
		const { name, value, type, checked } = event.target;
		const updatedValue = type === 'checkbox' ? checked : value;
		onInputChange({ target: { name, value: updatedValue } });
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		if (!plate || !capacity || !vehicleType || !provider) {
			setErrorMessage('Por favor, revisa los campos obligatorios');
			return;
		}

		const vehicleUpdate = {
			cControlVeh: vehicleData.cControlVeh,
			cPlacaVeh: plate.toUpperCase(),
			cActivoVeh: active ? '1' : '0',
			cCapacidadVeh: capacity,
			vTipoVeh: vehicleType.toUpperCase(),
			cControlPrv: parseInt(provider),
			cCodigoUsu: vehicleData.cCodigoUsu,
			cUsumodVeh: user?.id,
			dModifiVeh: dayjs().format("YYYY-MM-DDTHH:mm:ss")
		};

		const success = await dispatch(startUpdateVehicles(vehicleUpdate));
		if (success) {
			onClose();
		} else {
			setErrorMessage('Error al actualizar el vehículo.');
		}
	};

	return (
		<div className="popup-container">
			<div className="rounded-4 popup" style={{ fontSize: '13px' }}>
				<div className="rounded-3 mb-2" style={{ background: '#7c30b8', color: 'white', fontSize: '25px', textAlign: 'center' }}>
					<strong>Modificar Vehiculo</strong>
				</div>

				<div className='container'>
					<form onSubmit={onSubmit}>
						{/* Fila 1: Placas, Capacidad y tipo de vehiculo */}
						<div className="row mb-2">
							<div className="col-md-4">
								<label className="form-label">Placas</label>
								<input style={{ fontSize: '12px' }} required name='plate' value={plate} onChange={onInputChange} type="text" className="form-control" />
							</div>
							<div className="col-md-4">
								<label className="form-label">Capacidad</label>
								<input style={{ fontSize: '12px' }} required name='capacity' value={capacity} onChange={onInputChange} type="number" className="form-control" />
							</div>
							<div className="col-md-4">
								<label className="form-label">Tipo De vehículo</label>
								<select style={{ fontSize: '12px' }} required name='vehicleType' value={vehicleType} onChange={onInputChange} className="form-select">
									<option value="">Selección</option>
									<option value="CAMION">CAMION</option>
									<option value="URBAN">URBAN</option>
									<option value="PECERA">PECERA</option>
								</select>
							</div>
						</div>

						{/* Fila 2: Proveedor y Switch */}
						<div className="row mb-3 align-items-end">
							<div className="col-md-8">
								<label className="form-label">Proveedor</label>
								<select style={{ fontSize: '12px' }} required name='provider' value={provider} onChange={onInputChange} className="form-select">
									<option value="">Selección</option>
									{providers.map(p => (
										<option key={p.cControlPrv} value={parseInt(p.cControlPrv)}>{p.vNombrePrv}</option>
									))}
								</select>
							</div>

							<div className="col-md-4 pb-1">
								<div className="form-check form-switch">
									<input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" name="active" checked={active} onChange={handleInputChange} />
									<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Activa</label>
								</div>

							</div>
						</div>

						{errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

						<hr></hr>
						<div className='d-flex justify-content-start mt-4'>
							<button type="submit" className='btn btn-success m-1'>Guardar</button>
							<button type="button" className='btn btn-danger m-1' onClick={onClose}>Cerrar</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};