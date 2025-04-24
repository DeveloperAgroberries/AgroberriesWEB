import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ReporteAccesoVehicularList } from "../../components/Reports/ReporteAccesoVehicularList";
import { checkingIsLoadingVehicleAccessSlice, checkingShowViewVehicleAccess, resetVehicleAccessReports, resetVehicleAccessFilters, setVehicleAccessFilters } from "../../../store/slices/vehicleAccess/vehicleAccessSlice";
import { DownloadTableExcel } from "react-export-table-to-excel";

export const ReporteAccesoVehicular = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const[filters, setFiltersState] = useState({
        selectedDate1:'',
        selectedDate2:''
    })
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [isValidForSearch, setIsValidForSearch] = useState(false);

    useEffect(() => {
    	return () => {
        	dispatch(resetVehicleAccessFilters());
    	};
    }, [dispatch]);

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedDate1:'',
            selectedDate2:''
        });
        setIsSearchTriggered(false);
		dispatch( resetVehicleAccessFilters() );
        dispatch( resetVehicleAccessReports() );
    },[]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRAV = useCallback(() =>{
        const filterRAV = {
            startDate: filters.selectedDate1.trim(),
            endDate: filters.selectedDate2.trim(),
        };

        dispatch( resetVehicleAccessFilters() );
        dispatch( setVehicleAccessFilters({vehicleAccessFilters: filterRAV}));
	 	dispatch( checkingIsLoadingVehicleAccessSlice() );
	 	dispatch( checkingShowViewVehicleAccess() );
         setIsSearchTriggered(true);
    },[dispatch, filters]);

	useEffect(() => {
        if(filters.selectedDate1 !== '' && filters.selectedDate2 !== ''){
            setIsValidForSearch(true);
        }else{
            setIsValidForSearch(false);
        }
    }, [filters.selectedDate1, filters.selectedDate2])

	return (
    	<>
    	    <hr/>
    	    <hr/>
    	    <hr/>

    	    <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
    	        <h1 className='text-center text-black text text'> Reporte Acceso Vehicular</h1>
    	        <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
    	            <div className="mb-2 me-3">
    	                <div><label className="form-label m-1">Fecha Inicio</label></div>
    	                <div><input className="form-control" type="date" value={ filters.selectedDate1 } name="selectedDate1" onChange={handleInputChange}></input></div>
    	            </div>

    	            <div className="mb-2 me-3">
    	                <div><label className="form-label m-1">Fecha Fin</label></div>
    	                <div><input className="form-control" type="date" value={ filters.selectedDate2 } name="selectedDate2" onChange={handleInputChange}></input></div>
    	            </div>
		

    	            <div className="mt-2">
    	                <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ handleSearchRAV } disabled={!isValidForSearch}>Buscar</button>
    	            </div>

    	            <div className="mt-2">
    	                <button className="btn btn-outline-info rounded-2 m-1 mt-4" onClick={ cleanFilters } >Limpiar Filtros</button>
    	            </div>
    	        </div>

    	        <div className="container-fluid overflow-auto" id="containerPagesTable">
    	            <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
    	                <thead>
    	                    <tr>
    	                        <th scope="col">No.</th>
    	                        <th scope="col">Fecha de ingreso</th>
    	                        <th scope="col">Nombre Chofer</th>
    	                        <th scope="col">Acompañante</th>
    	                        <th scope="col">Empresa</th>
    	                        <th scope="col">Placa</th>
    	                        <th scope="col">Motivo de visita</th>
    	                        <th scope="col">Rancho</th>
    	                        <th scope="col">Hora de ingreso</th>
    	                        <th scope="col">Hora de salida</th>
    	                    </tr>
    	                </thead>
    	                <tbody>
							<ReporteAccesoVehicularList isSearchTriggered={isSearchTriggered}/>
    	                </tbody>
    	            </table>
    	        </div>

    	        <div>
    	            <DownloadTableExcel
    	                filename="Tabla de Registros"
    	                sheet="Registros"
    	                currentTableRef={tableRef.current}>
    	                    <button className="btn btn-outline-success rounded-2 m-1 mt-2">Exportar a Excel </button>
    	            </DownloadTableExcel>
    	        </div>
    	    </div>
    	</>
  	)
}
