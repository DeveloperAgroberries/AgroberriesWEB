import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReporteMonitoreoList } from "../../components";
import { checkingIsLoadingPhytoReportSlice, checkingPhytoShowView, setPhytoFilters } from "../../../store/slices/phytosanitary/phytosanitarySlice";
import { Loading } from "../../../ui/components/Loading";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { PestListForSelect } from "../../components/PestListForSelect";
import { RanchListForSelect } from "../../components/RanchListForSelect";

export const ReporteMonitoreo = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const {isLoading, showView} = useSelector(state => state.phytosanitary);
    const [selectedStartDateRM, setSelectedStartDateRM] = useState('');
    const [selectedEndDateRM, setSelectedEndDateRM] = useState('');
    const [selectedRanch, setSelectedRanch] = useState('');
    const [selectedPest, setSelectedPest] = useState('');
    const [isValid, setIsValid] = useState(false);

    const cleanFilters = () => {
        setSelectedStartDateRM('');
        setSelectedEndDateRM('');
        setSelectedRanch('');
        setSelectedPest('');
    }

    const handleSelectedStartDateRM = (event) => {
        setSelectedStartDateRM(event.target.value);
    };

    const handleSelectedEndDateRM = (event) => {
        setSelectedEndDateRM(event.target.value);
    };

    const handleSelectedRanch = (event) => {
        setSelectedRanch(event.target.value);
    };

    const handleSelectedPest = (event) => {
        setSelectedPest(event.target.value);
    };

    const handleSearchRM = (selectedStartDateRM, selectedEndDateRM, selectedRanch, selectedPest) =>{
        const filterRM = {
            dateStartRM: selectedStartDateRM.trim(),
            dateEndRM: selectedEndDateRM.trim(),
            ranch: selectedRanch.trim(),
            pest: selectedPest.trim(),
        }
        
        dispatch( setPhytoFilters({phytoFilters: filterRM}));
		dispatch( checkingIsLoadingPhytoReportSlice() );
		dispatch( checkingPhytoShowView() );
    }

    useEffect(() => {
        setIsValid(selectedRanch ? true : false);
    }, [selectedRanch])

  return (
    <>
            <hr/>
            <hr/>
            <hr/>

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{position: 'relative', width: '100%', height: '100%'}}>
                <h1 className='text-center text-black text'>Reporte Monitoreo</h1>
                <div className="container-fluid overflow-auto m-2" style={{display: "flex"}}>
                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Inicio</label></div>
                        <div><input className="form-control" type="date" value={ selectedStartDateRM } name="selectedStartDateRM" onChange={handleSelectedStartDateRM}></input></div>
                    </div>

                    <div className="mb-2 me-3">
                        <div><label className="form-label m-1">Fecha Fin</label></div>
                        <div><input className="form-control" type="date" value={ selectedEndDateRM } name="selectedEndDateRM" onChange={handleSelectedEndDateRM}></input></div>
                    </div>
                    
                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Rancho</label>
                        </div>
                        <div>    
                            <select className="form-select" value={ selectedRanch } name="selectedRanch" onChange={handleSelectedRanch}>
                                <option hidden value="0">Seleccion</option>
                                <RanchListForSelect/>
                            </select>
                            {!isValid && <label className="form-label m-1 text-danger">¡Campo obligatorio!</label>}
                        </div>
                    </div>

                    <div className="me-3">
                        <div>
                            <label className="form-label m-1">Plaga</label>
                        </div>
                        <div>    
                            <select className="form-select" value={ selectedPest } name="selectedPest" onChange={handleSelectedPest}>
                                <option hidden value="0">Seleccion</option>
                                <PestListForSelect/>
                            </select>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="btn btn-outline-success rounded-2 m-1 mt-4 " onClick={ () => handleSearchRM(selectedStartDateRM, selectedEndDateRM, selectedRanch, selectedPest) } disabled={!isValid}>Buscar</button>
                    </div>
    
                    <div className="mt-2">
                        <button className="btn btn-outline-info rounded-2 m-1 mt-4" style={{fontSize: "11px"}} onClick={ cleanFilters } >Limpiar Filtros</button>
                    </div>
                </div>

                { showView ? (
                    <div className="container-fluid overflow-auto">
                        <div className="container-fluid overflow-auto" id="containerPagesTable">
                            <table className="table table-bordered table-dark table-striped-columns table-hover" ref={tableRef}>
                                <thead>
                                    <tr>
                                        <th scope="col">Semana</th>
                                        <th scope="col">Mes</th>
                                        <th scope="col">Fecha</th>
                                        <th scope="col">Sector</th>
                                        <th scope="col">Tabla</th>
                                        <th scope="col">Tunel</th>
                                        <th scope="col">Planta</th>
                                        <th scope="col">Trips</th>
                                        <th scope="col">Acaro</th>
                                        <th scope="col">Chicharrita</th>
                                        <th scope="col">Mosca Blanca</th>
                                        <th scope="col">Araña Roja</th>
                                        <th scope="col">Gusano</th>
                                        <th scope="col">Drosophila</th>
                                        <th scope="col">Mayate</th>
                                        <th scope="col">Coleoptero</th>
                                        <th scope="col">Arrieras</th>
                                        <th scope="col">Tram Adhesivas</th>
                                        <th scope="col">Tram Vinagre</th>
                                        <th scope="col">Tram Melaza</th>
                                        <th scope="col">Roya</th>
                                        <th scope="col">Peronospora</th>
                                        <th scope="col">Botrytis</th>
                                        <th scope="col">Phytophtora</th>
                                        <th scope="col">Cenicilla</th>
                                        <th scope="col">Didymella</th>
                                        <th scope="col">Fumagina</th>
                                        <th scope="col">Antracnosis</th>
                                        <th scope="col">Alternaria</th>
                                        <th scope="col">Lasiodiplodia</th>
                                        <th scope="col">Fusarium</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ReporteMonitoreoList/>
                                </tbody>
                            </table>
                        </div>

                        { isLoading ?  <div className="mt-1"><Loading/></div> : <hr/> }
                        { isLoading ?  <hr/> :
                                        <div>
                                            <DownloadTableExcel
                                                filename="Reporte Monitoreo"
                                                sheet="Origen"
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
