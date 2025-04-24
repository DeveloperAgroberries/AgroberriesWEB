import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setBaseFilters } from '../../../store/slices/reports/reporteBaseSlice';
import { ReporteBaseComplementarioList } from '../../components/Reports/ReporteBaseComplementarioList';

export const ReporteBaseComplementario = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const [filters, setFiltersState] = useState({
        selectedStartDateRBT:'',
        selectedEndDateRBT:'',
        selectedSchedule:''
    });
    const [isValidForSearch, setIsValidForSearch] = useState(false);
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedStartDateRBT:'',
            selectedEndDateRBT:'',
            selectedSchedule:''
        })
        setIsSearchTriggered(false);
    },[]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRBT = useCallback(() =>{
        const filterRBT = {
            startDate: filters.selectedStartDateRBT.trim(),
            endDate: filters.selectedEndDateRBT.trim(),
            schedule: filters.selectedSchedule.trim(),
        }
        
        dispatch(resetFilters());
        dispatch( setBaseFilters({transportBaseFilters: filterRBT}));
		dispatch( checkingIsLoadingReportSlice() );
		dispatch( checkingShowView() );
        setIsSearchTriggered(true);
    },[dispatch, filters]);

    useEffect(() => {
        setIsValidForSearch(filters.selectedStartDateRBT && filters.selectedEndDateRBT)
    }, [filters.selectedStartDateRBT, filters.selectedEndDateRBT])

  return (
    <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{position: 'relative', width: '100%', height: '100%'}}>
                <h1 className='text-center text-black text text'>Reporte Base Complementario</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedStartDateRBT } name="selectedStartDateRBT" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedEndDateRBT } name="selectedEndDateRBT" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="me-3">
                        <div><label className="form-label m-1">Horario</label></div>
                        <div>          
                            <select className="form-select" value={ filters.selectedSchedule } name="selectedSchedule" onChange={handleInputChange}>
                                <option hidden value="">Seleccion</option>
                                <option value={"10:00:00"}>Matutino</option>
                                <option value={"10:00:01"}>Vespertino</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ handleSearchRBT } disabled={ !isValidForSearch }>Buscar</button>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4 " onClick={ cleanFilters } >Limpiar Filtros</button>
                    </div>
    
                </div>

                <div className="container-fluid overflow-auto" id="containerPagesTable">
                    <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
                        <thead>
                            <tr>
                                <th scope="col">No.</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Semana</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">NSS</th>
                                <th scope="col">RFC</th>
                                <th scope="col">CURP</th>
                                <th scope="col">Ruta</th>
                                <th scope="col">Predio</th>
                                <th scope="col">Km Recorridos</th>
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
                            <ReporteBaseComplementarioList
                                isSearchTriggered={isSearchTriggered}
                            />
                        </tbody>
                    </table>
                </div>

                <div>
                    <DownloadTableExcel
                        filename="Reporte Base"
                        sheet="Base"
                        currentTableRef={tableRef.current}>
                            <button className="btn btn-outline-success rounded-2 m-1 mt-2">Exportar a Excel </button>
                    </DownloadTableExcel>
                </div> 
            </div>
        </>
    )
}
