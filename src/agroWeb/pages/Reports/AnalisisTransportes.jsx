import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setActiveRecord, setTransportAnalysisFilters } from "../../../store/slices/reports/transportAnalysisSlice";
import { AnalisisTransportesList } from "../../components/Reports/AnalisisTransportesList";
import { AddComplement } from "../../components/TransportsAnalysis/AddComplement";

export const AnalisisTransportes = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const [filters, setFiltersState] = useState({
        selectedStartDateAT: '',
        selectedEndDateAT:''
    })
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const openRegisterPopup = (registerPopupComponent) => {
    	setIsPopupOpen(registerPopupComponent);
  	};

    const closeRegisterPopup = async () => {
    	setIsPopupOpen(null);
  	};

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedStartDateAT:'',
            selectedEndDateAT:''
        })

        dispatch ( setActiveRecord([]) )
        setIsSearchTriggered(false);
    }, []);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchAT = useCallback(() => {
        const filterAT = {
            startDate: filters.selectedStartDateAT.trim(),
            endDate: filters.selectedEndDateAT.trim()
          }

        dispatch( resetFilters() );
        dispatch( setTransportAnalysisFilters( {transportAnalysisFilters: filterAT}) );
		dispatch( checkingIsLoadingReportSlice() );
		dispatch( checkingShowView() );
        setIsSearchTriggered(true);
    }, [dispatch, filters]);

    useEffect(() => {
        if(filters.selectedStartDateAT !== '' && filters.selectedEndDateAT !== ''){
            setIsValid(true);
        }else{
            setIsValid(false);
        }
    }, [filters.selectedStartDateAT, filters.selectedEndDateAT])

    return (
		<>
			<hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <h1 className='text-center text-black text text'> Analisis de Transportes</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedStartDateAT } name="selectedStartDateAT" onChange={handleInputChange}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedEndDateAT } name="selectedEndDateAT" onChange={handleInputChange}></input></div>
                        {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ () => handleSearchAT() } disabled={!isValid}>Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" onClick={ cleanFilters } >Limpiar Filtros</button>
                    </div>
                </div>

                <div className="container-fluid overflow-auto" id="containerPagesTable">
                    <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
                        <thead>
                            <tr>
                                <th scope="col">Proveedor</th>
                                <th scope="col">Ruta</th>
                                <th scope="col">Fecha de registro</th>
                                <th scope="col">Costo Ruta</th>
                                <th scope="col">Total</th>
                                <th scope="col">Analista</th>
                                <th scope="col">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnalisisTransportesList
                                isSearchTriggered={isSearchTriggered}
                            />
                        </tbody>
                    </table>
                </div>

                <div className="ms-2 mb-1 mt-2">
                    <button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openRegisterPopup(<AddComplement onClose={ closeRegisterPopup }/>) } >Complementar</button>

                    <DownloadTableExcel
                        filename="Analisis de Transportes"
                        sheet="Registros"
                        currentTableRef={tableRef.current}>
                            <button className="btn btn-outline-success rounded-2 m-1">Exportar a Excel </button>
                    </DownloadTableExcel>
                </div>

                {isPopupOpen}
            </div>
		</>
  	)
}
