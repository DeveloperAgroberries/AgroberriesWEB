import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { RanchListForSelect, ReporteComedorGeneralList, UserListForSelect } from "../../components";
import { checkingDiningRoomShowView, checkingIsLoadingDiningRoom, resetDiningRoomRecords, resetFilters, setDiningRoomFilters } from "../../../store/slices/diningRoom/diningRoomSlice";
import { DownloadTableExcel } from "react-export-table-to-excel";


export const ReporteComedorGeneral = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const [filters, setFiltersState] = useState({
        selectedStartDateRCG: '',
        selectedEndDateRCG:'',
        selectedRanch:'',
        selectedUser:''
    })
    const [isValid, setIsValid] = useState(false);
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const cleanFiltersRCG = useCallback(() => {
        setFiltersState({
            setSelectedStartDateRCG:'',
            setSelectedEndDateRCG:'',
            setSelectedRanch:'',
            setSelectedUser:''
        })
        setIsSearchTriggered(false);
        dispatch( resetFilters() );
        dispatch( resetDiningRoomRecords() );
    },[]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRCG = useCallback(() =>{
        const filterRCG = {
            startDate: filters.selectedStartDateRCG.trim(),
            endDate: filters.selectedEndDateRCG.trim(),
            ranch: filters.selectedRanch.trim(),
            user: filters.selectedUser.trim()
        }
        
        dispatch( resetFilters() );
        dispatch( setDiningRoomFilters({diningRoomFilters: filterRCG}));
		dispatch( checkingIsLoadingDiningRoom() );
		dispatch( checkingDiningRoomShowView() );
        setIsSearchTriggered(true);
    },[dispatch, filters]);

    useEffect(() => {
        if(filters.selectedStartDateRCG !== '' && filters.selectedEndDateRCG !== ''){
            setIsValid(true);
        }else{
            setIsValid(false);
        }
    }, [filters.selectedStartDateRCG, filters.selectedEndDateRCG])

  return (
    <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{position: 'relative', width: '100%', height: '100%'}}>
                <h1 className='text-center text-black text'>Reporte General de Comedores</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedStartDateRCG } name="selectedStartDateRCG" onChange={handleInputChange}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedEndDateRCG } name="selectedEndDateRCG" onChange={handleInputChange}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Rancho</label></div>
                        <div><select className="form-select" value={ filters.selectedRanch } name="selectedRanch" onChange={handleInputChange}><option hidden value="0">Seleccion</option><RanchListForSelect/></select></div>
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Usuario</label></div>
                        <div><select className="form-select" value={filters.selectedUser} name="selectedRanch" onChange={handleInputChange}><option hidden value="0">Seleccion</option><UserListForSelect/></select></div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ handleSearchRCG } disabled={!isValid}>Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" onClick={ cleanFiltersRCG } >Limpiar Filtros</button>
                    </div>
                </div>

                <div className="container-fluid overflow-auto" id="containerPagesTable">
                    <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
                        <thead>
                            <tr>
                                <th scope="col">Conteo</th>
                                <th scope="col">Codigo Trabajador</th>
                                <th scope="col">Nombre Trabajador</th>
                                <th scope="col">Tipo Trabajador</th>
                                <th scope="col">Estado de Trabajdor</th>
                                <th scope="col">Alimento</th>
                                <th scope="col">Campo</th>
                                <th scope="col">Semana</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ReporteComedorGeneralList
                                isSearchTriggered={ isSearchTriggered }
                            />
                        </tbody>
                    </table>
                </div>

                <div>
                    <DownloadTableExcel
                        filename="Reporte General de Comedores"
                        sheet="General"
                        currentTableRef={tableRef.current}>
                            <button className="btn btn-outline-success rounded-2 m-1 mt-2">Exportar a Excel </button>
                    </DownloadTableExcel>
                </div>
            </div>
        </>
  )
}
