import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteListForSelect } from "../components/RouteListForSelect";
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setTransportRecordsFilters } from "../../store/slices/reports/editingTransportRecordsSlice";
import { EdicionRegistrosList } from "../components/Reports/EdicionRegistrosList";
import { startUpdateTransportRecords } from "../../store/slices/reports/thunks";
import { getRoutes } from "../../store/slices/rutas";
import { AuthContext } from "../../auth/context/AuthContext";
import dayjs from 'dayjs';
import { Button, Modal } from "react-bootstrap";

export const EdicionRegistrosPage = () => {
	const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
    const [filters, setFiltersState] = useState({
        selectedDateERP: '',
        selectedRouteERP: '',
        selectedEditRouteERP: ''
    })
	const [isValidForSearch, setIsValidForSearch] = useState(false);
	const [isValidForEditRoute, setIsValidForEditRoute] = useState(false);
	const [isValidForEdit, setIsValidForEdit] = useState(false);
	const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [uniqueReports, setUniqueReports] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { routes = [] } = useSelector((state) => state.routes);
    const date = new Date()

	useEffect(() => {
        return () => {
            // Resetea los filtros cuando el componente se desmonta
            dispatch(resetFilters());
        };
    }, [dispatch]);
	
	const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedDateERP:'',
            selectedRouteERP:'',
            selectedEditRouteERP:''
        });
		setIsSearchTriggered(false);
        setSelectedRows([]);
        setSelectAll(false);
    },[dispatch]);

    const hanldeInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

	const handleSearchERP = useCallback(() =>{
        const filterERP = {
            dateERP: filters.selectedDateERP.trim(),
            routeERP: filters.selectedRouteERP.trim(),
            editRouteERP: filters.selectedEditRouteERP.trim()
        };
        
		dispatch( resetFilters() );
        dispatch( setTransportRecordsFilters({transportRecordsFilters: filterERP}));
        dispatch( getRoutes() );
		dispatch( checkingIsLoadingReportSlice() );
		dispatch( checkingShowView() );
		setIsSearchTriggered(true);
    },[dispatch, filters]);

    const handleModifyRecords = useCallback(async () => {
        if (selectedRows.length > 0) {
            const updatedRecords = selectedRows.map(reportId => {
                const report = uniqueReports.find(item => item.cCodigoTrn === reportId);
                return{
                    cCodigoTrn:report.cCodigoTrn,
                    cCodigoappTrn:report.cCodigoappTrn,
                    vChoferTrn:report.vChoferTrn,
                    cCodigoTra:report.cCodigoTra,
                    cFormaregTrn:report.cFormaregTrn,
                    dRegistroTrn:report.dRegistroTrn,
                    cTiporegTrn:report.cTiporegTrn === 'Subida' ? "0" : "1",
                    cLongitudTrn:report.cLongitudTrn,
                    cLatitudTrn:report.cLatitudTrn,
                    cAlturaTrn:report.cAlturaTrn,
                    cCodigoUsu:report.cCodigoUsu,
                    dCreacionTrn:report.dCreacionTrn,
                    cControlVeh:report.cControlVeh,
                    cControlRut: parseInt(filters.selectedEditRouteERP, 10), // Asigna la nueva ruta
                    nCostoRut: routes.find(p => p.cControlRut.toString() === filters.selectedEditRouteERP)?.nCostoRut || 0, //y el costo
                    cUsumodTrn: user?.id,
                    dModifiTrn: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
                };
            });
            
            const success = await dispatch(startUpdateTransportRecords(updatedRecords)); // Dispara la acción para modificar los registros
            if(success){
                cleanFilters();
                setSelectedRows([]);
                setSelectAll(false);
                handleCloseModal();
            } else {
                alert("Error al actualizar los registros");
                handleCloseModal();
            }
        } else {
            alert("No hay registros seleccionados para modificar.");
            handleCloseModal();
        }
    }, [dispatch, setSelectedRows, filters, routes, user, date]);

    const handleSelectAllChange = useCallback((isChecked) => {
        setSelectAll(isChecked); // Cambia el estado de seleccionar todos
    }, []);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    //Para activacion del boton de busqueda
	useEffect(() => {
        setIsValidForSearch(filters.selectedDateERP && filters.selectedRouteERP)
    }, [filters.selectedDateERP, filters.selectedRouteERP])

    //Para activacion del combo de ruta para modificar

    useEffect(() => {
        setIsValidForEditRoute(selectedRows.length > 0);
    },[selectedRows]);

    //Limpia el Select cuando se desactive   
    useEffect(() => {
        if (!isValidForEditRoute) {
            setFiltersState(prevFilters => ({
                ...prevFilters,
                selectedEditRouteERP: ""
            }));
        }
    }, [isValidForEditRoute]);

    //Para activacion del boton de modificacion
    useEffect(() => {
        setIsValidForEdit(filters.selectedDateERP && filters.selectedRouteERP && filters.selectedEditRouteERP)
    }, [filters.selectedDateERP, filters.selectedRouteERP, filters.selectedEditRouteERP])

	return (
		<>
      		<hr/>
      		<hr/>
      		<hr/>

      		<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
        		<h1 className='text-center text-black text text'>Edicion masiva de registros</h1>
				<div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedDateERP } name="selectedDateERP" onChange={hanldeInputChange}></input></div>
						{!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio para busqueda!</label>}
					</div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">De:</label>
                        </div>
                        <div>          
                            <select className="form-select" value={ filters.selectedRouteERP } name="selectedRouteERP" onChange={hanldeInputChange}>
                                <option hidden value="">Seleccion</option>
                                <RouteListForSelect/>
                            </select>
							{!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio para busqueda!</label>}
                        </div>
                    </div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">A:</label>
                        </div>
                        <div>          
                            <select className="form-select" value={ filters.selectedEditRouteERP } name="selectedEditRouteERP" onChange={hanldeInputChange} disabled={!isValidForEditRoute}>
                                <option hidden value="">Seleccion</option>
                                <RouteListForSelect/>
                            </select>
							{!isValidForEditRoute && <label className="form-label m-1 text-danger">¡Campo obligatorio para edicion!</label>}
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={handleSearchERP} disabled={!isValidForSearch}>Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" style={{fontSize: "10px"}} onClick={ cleanFilters } >Limpiar Filtros</button>
                    </div>
                </div>
        		<div className="container-fluid overflow-auto" id="containerPagesTable">
          			<table className="table table-bordered table-dark table-striped-columns table-hover">
            			<thead>
              				<tr>
								<th>
									<input
										className ="form-check-input"
										type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAllChange(e.target.checked)}
									/>
								</th>
                                <th scope="col">Chofer</th>
                                <th scope="col">Trabajador</th>
                                <th scope="col">Tipo de registro</th>
                                <th scope="col">Proveedor</th>
                                <th scope="col">Vehiculo</th>
                                <th scope="col">Ruta</th>
                                <th scope="col">Fecha de registro</th>
                                <th scope="col">Costo</th>
              				</tr>
            			</thead>
            			<tbody>
							<EdicionRegistrosList
								isSearchTriggered={isSearchTriggered}
                                setSelectedRows={setSelectedRows}
                                selectAll={selectAll}
                                setUniqueReports={setUniqueReports}
							/>
            			</tbody>          
          			</table>
        		</div>

      			<div className="ms-2 mb-1 mt-2">
        			<button className="btn btn-outline-primary rounded-2 m-1" onClick={handleOpenModal} disabled={!isValidForEdit}>Modificar</button>
      			</div>
    		</div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás segur@ de que quieres editar estos registros?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleModifyRecords}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
		</>
	)
}
