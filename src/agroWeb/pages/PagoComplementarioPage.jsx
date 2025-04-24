import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../auth/context/AuthContext";
import { RouteListForSelect } from "../components/RouteListForSelect";
import { startSaveTransportRecord } from "../../store/slices/routeComplement/thunks";
import { resetRouteComplementFilters } from "../../store/slices/routeComplement/routeComplementSlice";
import { VehicleListForSelect } from "../components";
import { Button, Modal } from "react-bootstrap";
import dayjs from "dayjs";

export const PagoComplementarioPage = () => {
	const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
    const [filters, setFiltersState] = useState({
        selectedDatePCP: '',
        selectedVehiclePCP: '',
        selectedRoutePCP: ''
    })
	const [isValidForAdd, setIsValidForAdd] = useState(false);
	const [records, setRecords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { routes = [] } = useSelector((state) => state.routes);
    const { vehicles = [] } = useSelector((state) => state.vehicles);
    const date = new Date()

	useEffect(() => {
        return () => {
            dispatch(resetRouteComplementFilters());
        };
    }, [dispatch]);
	
	const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedDatePCP:'',
            selectedVehiclePCP:'',
            selectedRoutePCP:''
        });

        setRecords([]);
    },[dispatch]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

	const handleAddRecord = useCallback(async () => {
        const newRecord = {
            vChoferTrn:"Complemento Ruta",
            cCodigoTra:"00000",
            dRegistroTrn:dayjs(filters.selectedDatePCP).format("YYYY-MM-DD")+"T"+dayjs(date).format("HH:mm:ss"),
            cTiporegTrn:"Subida",
            cControlVeh:filters.selectedVehiclePCP,
            cControlRut:routes.find(p => p.cControlRut.toString() === filters.selectedRoutePCP)?.vDescripcionRut || "-",
            cCodigoUsu: user?.id
        };

        setRecords(prevRecords => [...prevRecords, newRecord]);
    }, [dispatch, filters, user, date]);

    const handleInsertRecord = useCallback(async () => {
        if (records.length > 0) {
            const insertRecord = records.map(reportId => {
                return{
                    cCodigoTrn:0,
                    cCodigoappTrn:1,
                    vChoferTrn:"Complemento Ruta",
                    cCodigoTra:"00000",
                    cFormaregTrn:"1",
                    dRegistroTrn:reportId.dRegistroTrn,
                    cTiporegTrn:"0",
                    cLongitudTrn:"-103.609149",
                    cLatitudTrn:"19.905528",
                    cAlturaTrn:"1345.199951",
                    cCodigoUsu:reportId.cCodigoUsu,
                    dCreacionTrn:dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
                    cControlVeh:vehicles.find(v => v.cPlacaVeh.toString().toUpperCase().trim() === reportId.cControlVeh.toString().toUpperCase().trim())?.cControlVeh || 0,
                    cControlRut:routes.find(r => r.vDescripcionRut.toString().toUpperCase().trim() === reportId.cControlRut.toString().toUpperCase().trim())?.cControlRut || 0,
                    nCostoRut: routes.find(c => c.vDescripcionRut.toString() === reportId.cControlRut.toString().toUpperCase().trim())?.nCostoRut || 0,
                };
            });
            
            const success = await dispatch(startSaveTransportRecord(insertRecord)); // Dispara la acción para modificar los registros
            console.log(success)
            if(success){
                cleanFilters();
                handleCloseModal();
            } else {
                alert("Error al actualizar los registros");
                handleCloseModal();
            }
        } else {
            alert("No hay registros para guardar.");
            handleCloseModal();
        }
    }, [dispatch, filters, routes, user, date]);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    //Para activacion del boton de busqueda
	useEffect(() => {
        setIsValidForAdd(filters.selectedDatePCP && filters.selectedVehiclePCP && filters.selectedRoutePCP)
    }, [filters.selectedDatePCP, filters.selectedVehiclePCP, filters.selectedRoutePCP])

	return (
		<>
			<hr/>
      		<hr/>
      		<hr/>

      		<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
        		<h1 className='text-center text-black'>Complemento de rutas</h1>
				<div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedDatePCP } name="selectedDatePCP" onChange={handleInputChange}></input></div>
					</div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Vehiculo</label>
                        </div>
                        <div>          
                            <select className="form-select" value={ filters.selectedVehiclePCP } name="selectedVehiclePCP" onChange={handleInputChange}>
                                <option hidden value="">Seleccion</option>
                                <VehicleListForSelect/>
                            </select>
                        </div>
                    </div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Ruta</label>
                        </div>
                        <div>          
                            <select className="form-select" value={ filters.selectedRoutePCP } name="selectedRoutePCP" onChange={handleInputChange}>
                                <option hidden value="">Seleccion</option>
                                <RouteListForSelect/>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={handleAddRecord} disabled={!isValidForAdd}>Agregar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" style={{fontSize: "8px"}} onClick={ cleanFilters } >Limpiar Selectores</button>
                    </div>
                </div>

        		<div className="container-fluid overflow-auto" id="containerPagesTable">
          			<table className="table table-bordered table-dark table-striped-columns table-hover">
            			<thead>
              				<tr>
								<th scope="col">Nombre</th>
								<th scope="col">Codigo Trabajador</th>
                                <th scope="col">Tipo de registro</th>
								<th scope="col">Dia de registro</th>
								<th scope="col">Vehiculo</th>
								<th scope="col">Ruta</th>
								<th scope="col">Usuario Creador</th>
              				</tr>
            			</thead>
            			<tbody>
							{records.length === 0 ? (
								<tr>
									<td colSpan="7" className="text-center">No hay registros agregados</td>
								</tr>
							) : (
								records.map((record, index) => (
									<tr key={index}>
										<td>{record.vChoferTrn}</td>
										<td>{record.cCodigoTra}</td>
										<td>{record.cTiporegTrn}</td>
										<td>{record.dRegistroTrn}</td>
										<td>{record.cControlVeh}</td>
										<td>{record.cControlRut}</td>
										<td>{record.cCodigoUsu}</td>
									</tr>
								))
							)}
            			</tbody>          
          			</table>
        		</div>

      			<div className="ms-3 mb-1 mt-2">
        			<button className="btn btn-outline-success rounded-2" onClick={handleOpenModal} >Guardar</button>
      			</div>
    		</div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás segur@ de que quieres agregar este/os complemneto/s de ruta/s?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleInsertRecord}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
		</>
	)
}
