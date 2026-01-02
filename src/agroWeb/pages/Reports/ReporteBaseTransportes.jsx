import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { ReporteBaseList } from '../../components';
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setBaseFilters } from '../../../store/slices/reports/reporteBaseSlice';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Swal from 'sweetalert2'; // 💡 Importar SweetAlert2

export const ReporteBaseTransportes = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const [filters, setFiltersState] = useState({
        selectedStartDateRBT: '',
        selectedEndDateRBT: '',
        selectedSchedule: ''
    });
    const [isValidForSearch, setIsValidForSearch] = useState(false);
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    const [totalRecords, setTotalRecords] = useState(0); // Estado para el conteo
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedStartDateRBT: '',
            selectedEndDateRBT: '',
            selectedSchedule: ''
        })
        setIsSearchTriggered(false);
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRBT = useCallback(() => {
        // 🚀 VALIDACIÓN CON SWEETALERT2
        if (!filters.selectedStartDateRBT || !filters.selectedEndDateRBT) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Por favor, selecciona tanto la Fecha Inicio como la Fecha Fin para realizar la búsqueda.',
                confirmButtonColor: '#7c30b8', // Color morado de tu tema
                confirmButtonText: 'Entendido'
            });
            return; // Detiene la función aquí
        }

        const filterRBT = {
            startDate: filters.selectedStartDateRBT.trim(),
            endDate: filters.selectedEndDateRBT.trim(),
            schedule: filters.selectedSchedule.trim(),
        }

        dispatch(resetFilters());
        dispatch(setBaseFilters({ transportBaseFilters: filterRBT }));
        dispatch(checkingIsLoadingReportSlice());
        dispatch(checkingShowView());
        setIsSearchTriggered(true);
    }, [dispatch, filters]);

    useEffect(() => {
        setIsValidForSearch(filters.selectedStartDateRBT && filters.selectedEndDateRBT)
    }, [filters.selectedStartDateRBT, filters.selectedEndDateRBT])

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

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Reporte Base</strong>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label className="form-label m-1">Consulta de información de registros de transportes.</label>
                </div>

                <div className="container-fluid overflow-auto m-2" style={{ display: "flex" }}>
                    <div className="mb-2 me-3">
                        <div><p className="m-1 me-3 sizeLetra">Fecha Inicio:</p></div>
                        <div><input className="form-control" type="date" value={filters.selectedStartDateRBT} name="selectedStartDateRBT" onChange={handleInputChange}></input></div>
                    </div>

                    <div className="mb-2 me-3">
                        <div><p className="m-1 me-3 sizeLetra">Fecha Fin:</p></div>
                        <div><input className="form-control" type="date" value={filters.selectedEndDateRBT} name="selectedEndDateRBT" onChange={handleInputChange}></input></div>
                    </div>

                    {/* <div className="me-3">
                        <div><label className="form-label m-1">Horario</label></div>
                        <div>
                            <select className="form-select" value={filters.selectedSchedule} name="selectedSchedule" onChange={handleInputChange}>
                                <option hidden value="">Seleccion</option>
                                <option value={"10:00:00"}>Matutino</option>
                                <option value={"10:00:01"}>Vespertino</option>
                            </select>
                        </div>
                    </div> */}

                    <div className="mb-2 me-2">
                        <button className="btn btn-warning rounded-2 m-1 mt-4 " onClick={handleSearchRBT}>Buscar</button>
                    </div>

                    <div className="mb-2 me-2">
                        <button className="btn btn-secondary rounded-2 m-1 mt-4 " onClick={cleanFilters} >Limpiar Filtros</button>
                    </div>

                    <div className="mb-2 ms-auto ms-2" style={{ width: '500px' }}>
                        <div><p className="m-0 me-3 sizeLetra">Buscar en resultados:</p></div>
                        <input type="text" className="form-control" placeholder="Buscar por vehiculo, ruta, proveedor o zona..." style={{ width: '500px' }} value={searchTerm} onChange={handleSearchChange} />
                    </div>

                </div>

                <div className="table-responsive" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover" ref={tableRef}>
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                {/* <th scope="col">No.</th> */}
                                <th scope="col">Fecha</th>
                                <th scope="col">Semana</th>
                                <th scope="col">Vehiculo</th>
                                <th scope="col">Ruta</th>
                                <th scope="col">Predio</th>
                                <th scope="col">Km Recorridos</th>
                                <th scope="col">Costo X persona</th>
                                <th scope="col">Costo Ruta</th>
                                <th scope="col">Capacidad</th>
                                <th scope="col">Cantidad Transportada</th>
                                <th scope="col">% Ocupacion</th>
                                <th scope="col">Costo/Km</th>
                                <th scope="col">Proveedor</th>
                                <th scope="col">Semana2</th>
                                <th scope="col">Costo/Persona</th>
                                <th scope="col">Zona</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ReporteBaseList isSearchTriggered={isSearchTriggered} searchTerm={searchTerm} setTotalRecords={setTotalRecords}/>
                        </tbody>
                    </table>
                </div>

                <div>
                    <DownloadTableExcel
                        filename="Reporte Base"
                        sheet="Base"
                        currentTableRef={tableRef.current}>
                        <button className="btn btn-success rounded-2 m-1 mt-2"><i className="fas fa-file-excel fa-lg"></i> Exportar ({totalRecords} registros) </button>
                    </DownloadTableExcel>
                </div>
            </div>
        </>
    )
}
