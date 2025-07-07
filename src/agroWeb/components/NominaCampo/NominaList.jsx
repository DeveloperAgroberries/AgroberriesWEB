import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNominaCampo, getFilterDepartamentos, iniciaUpdateNomina } from '../../../store/slices/nominaCampo/thunks';
import { Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import leaf_loader_slow from '../../../../assets/leaf_loader_slow.gif';
import { resetReports } from '../../../store/slices/nominaCampo/nominaCampoSlice'; // <-- ¡Añade esta importación!
import { Modal, Button, OverlayTrigger, Tooltip, FormControl, Form, InputGroup } from 'react-bootstrap';
import { te } from 'date-fns/locale';

export const ListNominaCampo = ({ isSearchTriggered }) => {
	const dispatch = useDispatch();
	const [showLoadingModal, setShowLoadingModal] = useState(false);
	const [banderaCodLote, setBanderaCodLote] = useState(false);

	const [mostrarDetallesLote, setMostrarDetallesLote] = useState(false);
	const [codigoLoteSeleccionado, setCodigoLoteSeleccionado] = useState('');
	const [nombreLoteSeleccionadoL, setnombreLoteSeleccionadoL] = useState('');
	const [codigoLoteSeleccionadoL, setCodigoLoteSeleccionadoL] = useState('');

	// --- Carga los departamentos cuando el componente se monta //////////////////////////////////////////////////////////////////
	const [filters, setFiltersState] = useState({
		temporada: '',
		departamento: ''
	});
	const [errorDepart, setErrorDepart] = useState(false);
	const [loadDepart, setLoadDepart] = useState(true);
	const { filterDep = [], isLoading: isLoadingDep, errorMessage: errorDep } = useSelector((state) => state.selNomina);
	useEffect(() => {
		if (filterDep.length > 0 || errorDep) {
			setLoadDepart(false);
		}
	}, [dispatch, isLoadingDep, filterDep.length, errorDep]);
	// Dependencias para volver a cargar si es necesario
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const { reports = [], isLoading: isLoadingNomina, errorMessage: errorNomina } = useSelector((state) => state.registrosNomina);
	const { registrosNominaFilters = {} } = useSelector((state) => state.registrosNomina);

	useEffect(() => {
		if (isSearchTriggered) {
			dispatch(getNominaCampo(registrosNominaFilters));
		}

		return () => {
			dispatch(resetReports());
		};
	}, [dispatch, isSearchTriggered, registrosNominaFilters])


	// Define onlyDate si es una función local, o impórtala si es de otro archivo.
	const onlyDate = (dateString) => {
		if (!dateString) return '';
		try {
			return dayjs(dateString).format('DD-MM-YYYY'); // Asegúrate de que dayjs esté funcionando correctamente
		} catch (e) {
			console.error("Error formatting date:", e);
			return dateString; // Retorna el string original si hay un error
		}
	};

	// Funciones para el modal de EDICIÓN
	const [showEditModal, setshowEditModal] = useState(false);       // Nuevo estado para el modal de edición
	const [selectedNombre, setSelectedNombre] = useState(null);

	// Se inicializará con los datos de 'selectedChofer'
	const [formDataEdit, setFormDataEdit] = useState({
		cCodigoEmp: '',
		cCodigoNht: '',
		cCodigoTem: '',
		nomTrabajador: '',
		vNombreLug: '',
		vNombreLot: '',
		cCodigoLot: '',
		vNombreCul: '',
		cCodigoCul: '',
		vNombreAct: '',
		cCodigoWks: ''
	});

	// useEffect para inicializar formDataEdit cuando se selecciona un chofer para editar
	useEffect(() => {
		if (selectedNombre) {
			setFormDataEdit({
				// Asegúrate de mapear todos los campos relevantes para la edición
				cCodigoEmp: selectedNombre.cCodigoEmp || '', //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
				cCodigoNht: selectedNombre.cCodigoNht || '', //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
				cCodigoTem: selectedNombre.cCodigoTem || '', //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
				nomTrabajador: selectedNombre.nomTrabajador || '',
				vNombreLug: selectedNombre.vNombreLug || '',
				vNombreLot: selectedNombre.vNombreLot || '',
				cCodigoLot: selectedNombre.cCodigoLot || '', //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
				vNombreCul: selectedNombre.vNombreCul || '',
				cCodigoCul: selectedNombre.cCodigoCul || '', //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
				vNombreAct: selectedNombre.vNombreAct || '',
				cCodigoWks: selectedNombre.cCodigoWks || '' //SOLO TOMA ESTE DATO LA API POR QUE ESTA EN LA TABLA NOMHOJADETAPP
			});
		}
	}, [selectedNombre]);

	const openEditModal = (nomina) => { // Recibe el objeto chofer como argumento
		setSelectedNombre(nomina);
		setshowEditModal(true);

		// Asegúrate de que estos valores existan en 'nomina'
		const temporadaValue = nomina.cCodigoTem || ''; // Si es undefined, usa cadena vacía
		const departamentoValue = nomina.cCodigoLug || ''; // Si es undefined, usa cadena vacía

		const newFiltersForThunk = {
			temporada: temporadaValue,
			departamento: departamentoValue
		};

		setFiltersState(prevState => ({
			...prevState,
			...newFiltersForThunk
		}));

		// SOLO DISPARAR LA ACCIÓN SI TENEMOS VALORES VÁLIDOS
		if (temporadaValue && departamentoValue) { // Ambos deben tener un valor
			dispatch(getFilterDepartamentos(newFiltersForThunk));
		} else {
			setErrorDepart(true);
			// Manejar el caso donde no hay datos completos para la búsqueda
			console.warn("No se pueden buscar departamentos porque faltan datos de temporada o departamento en la nómina.");
			// Opcional: mostrar un Toast, un mensaje de error, etc.
		}

	}
	const closeEditModal = () => {
		setshowEditModal(false);
		setSelectedNombre(null);
		setMostrarDetallesLote(false);
		setCodigoLoteSeleccionado('');
		setBanderaCodLote(false);
		setCodigoLoteSeleccionadoL('');
		// setFormDataEdit({
		// 	nomTrabajador: ''
		// });
	};

	// Función para manejar los cambios en el formulario de edición
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormDataEdit(prevFormData => ({
			...prevFormData,
			[name]: value
		}));
	};

	if (isLoadingNomina) {
		return (
			<tr>
				<td colSpan="12" className="text-center">
					{/* <Spinner animation="border" /> Cargando datos... */}
					<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
						<img
							src={leaf_loader_slow}
							alt="Cargando..."
							style={{ width: '64px', height: '64px' }}
						/>
					</div>
					<h4>Cargando...</h4>
				</td>
			</tr>
		);
	}

	if (errorNomina) {
		return (
			<tr>
				<td colSpan="12" className="text-center">
					<Alert variant="danger">
						{errorNomina ? `Error al cargar datos: ${errorNomina}` : `Error al cargar complementarios: ${errorNomina}`}
					</Alert>
				</td>
			</tr>
		);
	}

	const handleSelectLote = (lote) => {
		// setSelectedLote(lote);
		// setNombreLoteSeleccionado(lote.nombreLote);
		setCodigoLoteSeleccionado(lote.codigoLote);
		setCodigoLoteSeleccionadoL(lote.codigoLote.trim());
		setnombreLoteSeleccionadoL(lote.nombreLote.trim());
		setMostrarDetallesLote(true);
		setBanderaCodLote(false);
		// console.log("Lote seleccionado:", lote.codigoLote.trim());
		// return
	};

	const handleSubmitEdit = async (event) => {
		if (codigoLoteSeleccionadoL != '') {
			setShowLoadingModal(true);
			event.preventDefault();
			setShowLoadingModal(true);

			const dataToSend = {
				...formDataEdit,
				cCodigoLot: codigoLoteSeleccionadoL
			};

			// console.log('Datos del formulario enviados:', dataToSend);
			// alert('Datos enviados: ' + JSON.stringify(dataToSend, null, 2)); ;
			// return
			closeEditModal();
			setShowLoadingModal(false);
			// Llama al thunk de actualización
			const success = await dispatch(iniciaUpdateNomina(dataToSend));

			// return;
			if (success) {
				setShowLoadingModal(false);
				dispatch(getNominaCampo(registrosNominaFilters)) // Recarga los choferes para ver los cambios
				closeEditModal();
			} else {
				setShowLoadingModal(false);
				alert('Ocurrió un error al actualizar el chofer. Comunícate con Soporte TI.');
				closeEditModal();
			}
		} else {
			setBanderaCodLote(true);
		}
	};

	return (
		<>
			{reports.length > 0 ? (
				reports.map((nomina, index) => (
					<tr key={index + 1}>
						{/* <td>{nomina.cCodigoEmp.trim()}</td> */}
						<td className='text-center'>{nomina.cCodigoTem.trim()}</td>
						<td>{onlyDate(nomina.dDocumentoNht)}</td>
						<td hidden>nomina.codigo</td>
						<td>{nomina.nomTrabajador}</td>
						<td>
							<OverlayTrigger placement="left" overlay={<Tooltip id={`tooltip-edit-${nomina.vNombreLug}`}>Editar Nomina</Tooltip>}>
								<a type="button" onClick={() => openEditModal(nomina)}><i className="fas fa-edit fa-lg" style={{ marginRight: '5px', color: '#8000ff' }}></i>{nomina.vNombreLug}</a>
							</OverlayTrigger>
						</td>
						<td>{nomina.vNombreLot}</td>
						<td>{nomina.vNombreCul}</td>
						<td>{nomina.vNombreAct}</td>
						<td className='text-center'>{nomina.nCantidadNht}</td>
						{/* <td>{nomina.cNominaAsi}</td> */}
						<td>{nomina.cCodigoWks}</td>
						{/* <td>{nomina.cCodigoLib}</td>
						<td>{nomina.cTipoNht}</td>
						<td>{nomina.cCodigoLab}</td>
						<td>{nomina.nNumeroLab}</td>
						<td>{nomina.vTipoDestajoNht}</td> */}
						<td className='text-center'>{nomina.cCodigoTam}</td>
						<td>{nomina.cTipoActividadNht}</td>
						<td>{nomina.cCodigoEnv}</td>
					</tr>
				))
			) : (
				<tr>
					<td colSpan="12" className="text-center">
						No hay datos disponibles.
					</td>
				</tr>
			)}

			{/* Modal para desglosar info Trabajador */}
			<Modal show={showEditModal} onHide={closeEditModal} size="lg" centered>
				<Modal.Header style={{ background: '#7c30b8' }} closeButton>
					<Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Editar Registro</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{/* Aquí iría el formulario de edición de chofer */}
					{selectedNombre ? ( // Solo muestra el contenido si hay un chofer seleccionado
						<div>
							<form style={{ fontSize: '12px' }}>

								<div className="row">
									<div className="col-md">
										<label htmlFor="nomTrabajador">Nombre Trabajador:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="nomTrabajador" name="nomTrabajador" value={formDataEdit.nomTrabajador || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>

									<div className="col-md">
										<label htmlFor="cCodigoWks">Dispositivo:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="cCodigoWks" name="cCodigoWks" value={formDataEdit.cCodigoWks || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>
								</div>

								<div className="row">
									<div className="col-md">
										<label htmlFor="nombreLugar">Nombre Lugar:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="nombreLugar" name="nombreLugar" value={formDataEdit.vNombreLug || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>

									<div className="col-md">
										<label htmlFor="vNombreLot">Nombre Lote:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="vNombreLot" name="vNombreLot" value={formDataEdit.vNombreLot || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>
									<div className="col-md">
										<label htmlFor="vNombreCul">Nombre Cultivo:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="vNombreCul" name="vNombreCul" value={formDataEdit.vNombreCul || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>
									<div className="col-md">
										<label htmlFor="vNombreAct">Nombre Actividad:</label>
										<InputGroup size="sm" className="mb-3">
											<Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
												id="vNombreAct" name="vNombreAct" value={formDataEdit.vNombreAct || ''} onChange={handleInputChange} required disabled />
										</InputGroup>
									</div>
								</div>

								<div className="mb-2 me-3">
									<div><label className="form-label m-1">Lote</label></div>
									<div>
										<select className="form-select" name="Lote" value={codigoLoteSeleccionado}
											onChange={(e) => {
												const selectedCodigo = e.target.value;
												const loteSeleccionado = filterDep.find(d => d.codigoLote === selectedCodigo);
												if (loteSeleccionado) {
													handleSelectLote(loteSeleccionado);
												}
											}}>
											{loadDepart ? (<option value="">Cargando Lote...</option>) : errorDepart ? (<option value="">Error al cargar...</option>) : (<option value="">Selecciona Lote</option>)}
											{filterDep.map((depart) => (
												<option key={depart.codigoLote} value={depart.codigoLote}>
													{depart.codigoLote} - {depart.nombreLote}
												</option>
											))}
										</select>
									</div>
								</div>

								{mostrarDetallesLote && (
									<div className="mb-3 row">
										<div className="col-md-2">
											<label className="form-label">Código Lote</label>
											<input type="text" className="form-control" name='cCodigoCul' value={codigoLoteSeleccionadoL} style={{ fontSize: '12px' }} readOnly disabled />
										</div>
										<div className="col-md-5">
											<label className="form-label">Nombre Lote</label>
											<input type="text" className="form-control" value={nombreLoteSeleccionadoL} style={{ fontSize: '12px' }} readOnly disabled />
										</div>
									</div>
								)}
								{banderaCodLote && (
									<div className="alert alert-danger" role="alert">
										Por favor, selecciona un departamento válido.
									</div>
								)}

								<div className="modal-footer">
									<button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cerrar</button>
									<button type="button" className="btn btn-primary" onClick={handleSubmitEdit}>Guardar Cambios</button>
								</div>
							</form>
						</div>
					) : (
						<p>No hay datos para mostrar.</p>
					)}
				</Modal.Body>
			</Modal>

			{/* --- Modal de Carga --- */}
			<Modal show={showLoadingModal} centered backdrop="static" keyboard={false}>
				<Modal.Body className="text-center">
					{/* <Spinner animation="border" role="status" variant="success" className="mb-3" /> */}
					<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
						<img
							src={leaf_loader_slow}
							alt="Cargando..."
							style={{ width: '64px', height: '64px' }}
						/>
					</div>
					<h4>Cargando</h4>
					<p>Por favor, espera un momento.</p>
				</Modal.Body>
			</Modal>
		</>
	)
}
