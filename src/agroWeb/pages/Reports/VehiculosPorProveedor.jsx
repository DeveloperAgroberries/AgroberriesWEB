import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkingShowView, resetFilters, setFilters } from "../../../store/slices/reports/reportsSlice";
import { ProvidersList } from "../../components/ProviderListForReportSelect";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { VehiculosPorProveedorList } from "../../components/Reports/VehiculosPorProveedorList";

export const VehiculosPorProveedor = () => {
    const dispatch = useDispatch();
    const tableVehiclesRef = useRef(null);
    const {isLoading, showView} = useSelector(state => state.reports);
    const [selectedProvider, setSelectedProvider] = useState('');
	const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    const cleanFilters = () => {
        setSelectedProvider('');
        setIsSearchTriggered(false);
    }

    const handleSelectedProvider = (event) => {
        setSelectedProvider(event.target.value);
    };  

    const handleSearchVPP = (selectedProvider) =>{
        
        const filterVPP = {
            provider: selectedProvider.trim()
          }
        
        dispatch(resetFilters());
        dispatch( setFilters({filters: filterVPP}));
		dispatch( checkingShowView() );
        setIsSearchTriggered(true);
    }
    
    return (
        <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <h1 className='text-center text-black text text'>Vehiculos por Proveedor</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
            
                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Proveedor</label>
                        </div>
                        <div>    
                            <select className="form-select" value={ selectedProvider } name="selectedProvider" onChange={handleSelectedProvider}>
                                <option hidden value="0">Seleccion</option>
                                <ProvidersList/>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ () => handleSearchVPP( selectedProvider) } >Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4 " onClick={ cleanFilters } >Limpiar Filtros</button>
                    </div>
                </div>

                { showView ? (
                    <div className="container-fluid overflow-auto">
                        <div className="container-fluid overflow-auto" id="containerPagesTable">
                            <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableVehiclesRef}>
                                <thead>
                                    <tr>
                                        <th scope="col">No.</th>
                                        <th scope="col">Proveedor</th>
                                        <th scope="col">Vehiculo Activo</th>
                                        <th scope="col">Vehiculo</th>
                                        <th scope="col">Capacidad</th>
                                        <th scope="col">Tipo de Vehiculo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <VehiculosPorProveedorList/>
                                </tbody>
                            </table>
                        </div>

                        { isLoading ?  <hr/> :
                                        <div>
                                            <DownloadTableExcel
                                                filename="Tabla de Vehiculos"
                                                sheet="Vehiculos"
                                                currentTableRef={tableVehiclesRef.current}>
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
