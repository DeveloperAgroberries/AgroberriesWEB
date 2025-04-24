import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { RegistrosTransportesList } from "../../components/Reports/RegistrosTransportesList";
import { VehicleListForSelect } from "../../components/VehicleListForSelect";
import { RouteListForSelect } from "../../components/RouteListForSelect";
import { useDispatch, useSelector } from "react-redux";
import { checkingIsLoadingReportSlice, checkingShowView, resetFilters, setRegistrosTransporteFilters } from "../../../store/slices/reports/registrosTransporteSlice";
import { ProvidersList } from "../../components/ProviderListForReportSelect";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { AuthContext } from "../../../auth/context/AuthContext";

export const RegistrosTransportes = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const[filters, setFiltersState] = useState({
        selectedDate1:'',
        selectedDate2:'',
        selectedProvider:'',
        selectedVehicle:'',
        selectedRoute:'',
    })
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [isValidForSearch, setIsValidForSearch] = useState(false);
    const [disabledForSearch, setDisabledForSearch] = useState(false);
    const {user} = useContext(AuthContext);
    const {providers =[]} = useSelector( (state) => state.providers );

    useEffect(() => {
        return () => {
            dispatch(resetFilters());
        };
    }, [dispatch]);

    const cleanFilters = useCallback(() => {
        setFiltersState({
            selectedDate1:'',
            selectedDate2:'',
            selectedProvider:'',
            selectedVehicle:'',
            selectedRoute:''
        });
        setIsSearchTriggered(false);
    },[]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFiltersState((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchRT = useCallback(() =>{
        const filterRT = {
            startDate: filters.selectedDate1.trim(),
            endDate: filters.selectedDate2.trim(),
            provider: filters.selectedProvider.trim(),
            vehicle: filters.selectedVehicle.trim(),
            route: filters.selectedRoute.trim(),
        };

        dispatch( resetFilters() );
        dispatch( setRegistrosTransporteFilters({registrosTransporteFilters: filterRT}));
		dispatch( checkingIsLoadingReportSlice() );
		dispatch( checkingShowView() );
        setIsSearchTriggered(true);
    },[dispatch, filters]);

    
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
    
    return (
        <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <h1 className='text-center text-black text text'> Registros de transportes</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedDate1 } name="selectedDate1" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ filters.selectedDate2 } name="selectedDate2" onChange={handleInputChange}></input></div>
                        {!isValidForSearch && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>
            
                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Proveedor</label>
                        </div>
                        <div>    
                            <select className="form-select" value={ filters.selectedProvider } name="selectedProvider" onChange={handleInputChange}>
                                <option hidden value="0">Seleccion</option>
                                <ProvidersList/>
                            </select>
                        </div>
                        {providersToDisplay.length === 1 && !filters.selectedProvider && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                    </div>

                    <div className="me-3" hidden={disabledForSearch}>
                        <div><label className="form-label m-1">Vehiculo</label></div>
                        <div>
                            <select className="form-select" value={ filters.selectedVehicle } name="selectedVehicle" onChange={handleInputChange} disabled={disabledForSearch}>
                                <option hidden value="">Seleccion</option>
                                <VehicleListForSelect/>
                            </select>
                        </div>
                    </div>
            
                    <div className="me-3" hidden={disabledForSearch}>
                        <div>
                            <label className="form-label m-1">Ruta</label>
                        </div>
                        <div>
                            <select className="form-select" value={ filters.selectedRoute } name="selectedRoute" onChange={handleInputChange} disabled={disabledForSearch}>
                                <option hidden value="">Seleccion</option>
                                <RouteListForSelect/>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ handleSearchRT } disabled={!isValidForSearch}>Buscar</button>
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
                            <RegistrosTransportesList isSearchTriggered={isSearchTriggered}/>
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
