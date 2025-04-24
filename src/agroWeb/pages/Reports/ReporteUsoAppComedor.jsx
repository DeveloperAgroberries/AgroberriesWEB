import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkingDiningRoomShowView, checkingIsLoadingDiningRoom, setDiningRoomFilters } from "../../../store/slices/diningRoom/diningRoomSlice";
import { ReporteUsoAppComedorList } from "../../components/Reports/ReporteUsoAppComedorList";
import { Loading } from "../../../ui/components/Loading";
import { DownloadTableExcel } from "react-export-table-to-excel";

export const ReporteUsoAppComedor = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const {isLoading, showView} = useSelector(state => state.diningRoom);
    const [selectedStartDateRUAC, setSelectedStartDateRUAC] = useState('');
    const [selectedEndDateRUAC, setSelectedEndDateRUAC] = useState('');
    const [isValid, setIsValid] = useState(false);

    const cleanFiltersRUAC = () => {
        setSelectedStartDateRUAC('');
        setSelectedEndDateRUAC('');
    }

    const handleSelectedStartDateRUAC = (event) => {
        setSelectedStartDateRUAC(event.target.value);
    };

    const handleSelectedEndDateRUAC = (event) => {
        setSelectedEndDateRUAC(event.target.value);
    };

    const handleSearchRUAC = (setSelectedStartDateRUAC, setSelectedEndDateRUAC) =>{
        const filterRUAC = {
            dateStartRUAC: setSelectedStartDateRUAC.trim(),
            dateEndRUAC: setSelectedEndDateRUAC.trim(),
        }
        
        dispatch( setDiningRoomFilters({diningRoomFilters: filterRUAC}));
		dispatch( checkingIsLoadingDiningRoom() );
		dispatch( checkingDiningRoomShowView() );
    }

    useEffect(() => {
        if(selectedStartDateRUAC !== '' && selectedEndDateRUAC !== ''){
            setIsValid(true);
        }
    }, [selectedStartDateRUAC, selectedEndDateRUAC])

  return (
    <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{position: 'relative', width: '100%', height: '100%'}}>
                <h1 className='text-center text-black text'>Reporte de uso de APP</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ selectedStartDateRUAC } name="selectedStartDateRUAC" onChange={handleSelectedStartDateRUAC}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ selectedEndDateRUAC } name="selectedEndDateRUAC" onChange={handleSelectedEndDateRUAC}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ () => handleSearchRUAC(selectedStartDateRUAC, selectedEndDateRUAC) } disabled={!isValid}>Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" onClick={ cleanFiltersRUAC } >Limpiar Filtros</button>
                    </div>
                </div>

                { showView ? (
                    <div className="container-fluid overflow-auto">
                        <div className="container-fluid overflow-auto" id="containerPagesTable">
                            <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">Semana</th>
                                        <th scope="col">Fecha de Uso</th>
                                        <th scope="col">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ReporteUsoAppComedorList/>
                                </tbody>
                            </table>
                        </div>

                        { isLoading ?  <div className="mt-1"><Loading/></div> : <hr/> }
                        { isLoading ?  <hr/> :
                                        <div>
                                            <DownloadTableExcel
                                                filename="Reporte Uso de App Comedores"
                                                sheet="Uso"
                                                currentTableRef={tableRef.current}>
                                                    <button className="btn btn-outline-success rounded-2 m-1 mt-2">Exportar a Excel </button>
                                            </DownloadTableExcel>
                                        </div>
                        }
                    </div>
                ) : <hr/>}         
            </div>
        </>
  )
}
