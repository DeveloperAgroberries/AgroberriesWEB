import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { RegistrosTransportesList } from "../../components/Reports/RegistrosTransportesList";
import { VehicleListForSelect } from "../../components/VehicleListForSelect";
import { RouteListForSelect } from "../../components/RouteListForSelect";
import { useDispatch, useSelector } from "react-redux";
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setRegistrosTransporteFilters } from "../../../store/slices/reports/registrosTransporteSlice";
import { ProvidersList } from "../../components/ProviderListForReportSelect";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { AuthContext } from "../../../auth/context/AuthContext";
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Swal from 'sweetalert2'; // 💡 Importar SweetAlert2

export const RegistrosTransportes = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const [filters, setFiltersState] = useState({
        selectedDate1: '',
        selectedDate2: '',
        selectedProvider: '',
        selectedVehicle: '',
        selectedRoute: '',
    })
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [isValidForSearch, setIsValidForSearch] = useState(false);
    const [disabledForSearch, setDisabledForSearch] = useState(false);
    const { user } = useContext(AuthContext);
    const { providers = [] } = useSelector((state) => state.providers);

    const [totalRecords, setTotalRecords] = useState(0); // Estado para el conteo
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedDate1: '',
            selectedDate2: '',
            selectedProvider: '',
            selectedVehicle: '',
            selectedRoute: ''
        });
        // 2. LIMPIA EL INPUT DINÁMICO (el buscador de resultados)
        setSearchTerm('');

        // 3. Resetea el trigger de búsqueda y limpia Redux
        setIsSearchTriggered(false);
        dispatch(resetFilters());

        // Opcional: si quieres resetear el conteo del botón Excel
        setTotalRecords(0);
    }, [dispatch]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRT = useCallback(() => {

        // 🚀 VALIDACIÓN CON SWEETALERT2
        if (!filters.selectedDate1 || !filters.selectedDate2) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Por favor, selecciona tanto la Fecha Inicio como la Fecha Fin para realizar la búsqueda.',
                confirmButtonColor: '#7c30b8', // Color morado de tu tema
                confirmButtonText: 'Entendido'
            });
            return; // Detiene la función aquí
        }

        const filterRT = {
            startDate: filters.selectedDate1.trim(),
            endDate: filters.selectedDate2.trim(),
            provider: filters.selectedProvider.trim(),
            vehicle: filters.selectedVehicle.trim(),
            route: filters.selectedRoute.trim(),
        };

        dispatch(resetFilters());
        dispatch(setRegistrosTransporteFilters({ registrosTransporteFilters: filterRT }));
        dispatch(checkingIsLoadingReportSlice());
        dispatch(checkingShowView());
        setIsSearchTriggered(true);
    }, [dispatch, filters]);


    const filteredProviders = providers.filter(provider => provider.cUsuwebUsu === user.id);
    const providersToDisplay = filteredProviders.length > 0 ? filteredProviders : providers;

    useEffect(() => {
        const isProviderRequired = providersToDisplay.length === 1;
        setIsValidForSearch(
            filters.selectedDate1 &&
            filters.selectedDate2 &&
            (!isProviderRequired || filters.selectedProvider)
        );
    }, [filters.selectedDate1, filters.selectedDate2, filters.selectedProvider, providersToDisplay.length])

    useEffect(() => {
        const isProviderRequired = providersToDisplay.length === 1;
        setDisabledForSearch(isProviderRequired);
    }, [providersToDisplay.length])

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            <style type="text/css">
                {`
                    /* Estilos para la tabla HTML nativa */

                    .table tbody tr:hover {
                        --bs-table-hover-bg: #d19ff9 !important; /* Color que tenías */  
                    }

                    /* Estilo para las filas al pasar el ratón */
                    .table tbody tr:hover {
                        background-color: #d19ff9 !important; /* Color que tenías */
                        {/* cursor: pointer; */}
                    }

                    /* Estilos para los encabezados de la tabla */
                    .table thead th {
                        padding-left: 8px;
                        padding-right: 8px;
                        font-size: 14px;
                        font-weight: bold;
                        background-color: #7c30b8; /* Color de fondo que tenías */
                        color: white; /* Color de texto que tenías */
                    }

                    /* Estilos para body de la tabla */
                    .table tbody td {
                        padding-left: 8px;
                        padding-right: 8px;
                        font-size: 12px;
                        white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                    }

                    /* Redondear esquinas del encabezado */
                    .table thead th:first-child {
                        border-top-left-radius: 8px;
                    }
                    .table thead th:last-child {
                        border-top-right-radius: 8px;
                    }

                    /* Estilo para las celdas del cuerpo */
                    .mi-tabla-activos tbody td {
                        min-height: 30px; /* Puedes ajustar esto */
                        padding-left: 8px;
                        padding-right: 8px;
                    }

                    /* Opcional: Redondear también las esquinas inferiores de la tabla (siempre y cuando la tabla no tenga scroll interno que las oculte) */
                    .table tbody tr:last-child td:first-child {
                        border-bottom-left-radius: 8px;
                    }
                    .table tbody tr:last-child td:last-child {
                        border-bottom-right-radius: 8px;
                    }

                    .sizeLetra{
                        font-size: 13px;
                    }
                `}
            </style>
            <br />
            <br />

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Registros de Transportes</strong>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label className="form-label m-1">Consulta de información de registros de transportes.</label>
                </div>

                {/* <div className="container-fluid overflow-auto m-2" style={{ display: "flex" }}>
                    <div className="mb-2 me-3">
                        <div><p className="m-0 me-3 sizeLetra">Fecha Inicio:</p></div>
                        <div><input className="form-control" type="date" value={filters.selectedDate1} name="selectedDate1" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={filters.selectedDate2} name="selectedDate2" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Proveedor</label>
                        </div>
                        <div>
                            <select className="form-select" value={filters.selectedProvider} name="selectedProvider" onChange={handleInputChange}>
                                <option hidden value="0">Seleccion</option>
                                <ProvidersList />
                            </select>
                        </div>
                        {providersToDisplay.length === 1 && !filters.selectedProvider && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="me-3" hidden={disabledForSearch}>
                        <div><label className="form-label m-1">Vehiculo</label></div>
                        <div>
                            <select className="form-select" value={filters.selectedVehicle} name="selectedVehicle" onChange={handleInputChange} disabled={disabledForSearch}>
                                <option hidden value="">Seleccion</option>
                                <VehicleListForSelect />
                            </select>
                        </div>
                    </div>

                    <div className="me-3" hidden={disabledForSearch}>
                        <div>
                            <label className="form-label m-1">Ruta</label>
                        </div>
                        <div>
                            <select className="form-select" value={filters.selectedRoute} name="selectedRoute" onChange={handleInputChange} disabled={disabledForSearch}>
                                <option hidden value="">Seleccion</option>
                                <RouteListForSelect />
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={handleSearchRT} disabled={!isValidForSearch}>Buscar</button>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" onClick={cleanFilters} >Limpiar Filtros</button>
                    </div>
                </div> */}

                <div className="d-flex flex-wrap align-items-end m-1">

                    {/* Fecha Inicio */}
                    <div className="mb-2 me-3">
                        <div><p className="m-0 me-3 sizeLetra">Fecha Inicio:</p></div>
                        <div><input className="form-control" type="date" value={filters.selectedDate1} name="selectedDate1" onChange={handleInputChange}></input></div>
                        {/* {!isValidForSearch && <label className="m-0 me-3 sizeLetra text-danger">¡Campo obligatorio!</label>} */}
                    </div>

                    {/* Fecha Fin */}
                    <div className="mb-2 me-3">
                        <div><p className="m-0 me-3 sizeLetra">Fecha fin:</p></div>
                        <div><input className="form-control" type="date" value={filters.selectedDate2} name="selectedDate2" onChange={handleInputChange}></input></div>
                        {/* {!isValidForSearch && <label className="m-0 me-3 sizeLetra text-danger">¡Campo obligatorio!</label>} */}
                    </div>

                    {/* Botones de Acción (alineados con los inputs) */}
                    <div className="mb-2 me-3 d-flex">
                        <button className="btn btn-warning rounded-2 m-1 mt-4 " onClick={handleSearchRT}>Buscar</button>
                        <button className="btn btn-secondary rounded-2 m-1 mt-4" onClick={cleanFilters} >Limpiar Filtros</button>
                    </div>

                    <div className="mb-2 ms-auto ms-2" style={{ width: '500px' }}>
                        <div><p className="m-0 me-3 sizeLetra">Buscar en resultados:</p></div>
                        <input type="text" className="form-control" placeholder="Buscar por chofer, proveedor, vehiculo o ruta..." style={{ width: '500px' }} value={searchTerm} onChange={handleSearchChange} />
                    </div>

                </div>


                <div className="table-responsive" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover" ref={tableRef}>{/* Puedes añadir tus propias clases CSS */}
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                {/* <th scope="col">No.</th> */}
                                <th scope="col">Chofer</th>
                                <th scope="col">Trabajador</th>
                                <th scope="col">Tipo de registro</th>
                                <th scope="col">Proveedor</th>
                                <th scope="col">Vehiculo</th>
                                <th scope="col">Ruta</th>
                                <th scope="col">Fecha de registro</th>
                                <th scope="col">Costo por persona</th>
                                <th scope="col">Costo por ruta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <RegistrosTransportesList isSearchTriggered={isSearchTriggered} searchTerm={searchTerm} setTotalRecords={setTotalRecords} />
                        </tbody>
                    </table>
                </div>

                <div>
                    <DownloadTableExcel
                        filename="Tabla de Registros"
                        sheet="Registros"
                        currentTableRef={tableRef.current}>
                        <button className="btn btn-success rounded-2 m-1 mt-2"><i className="fas fa-file-excel fa-lg"></i> Exportar ({totalRecords} registros) </button>
                    </DownloadTableExcel>
                </div>
            </div>
        </>
    )
}
