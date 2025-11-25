import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { startLoadingReporteChecador } from "../../../store/slices/reporteChecadorFacial/thunks";
import Swal from 'sweetalert2';
import { DownloadTableExcel } from "react-export-table-to-excel";
import {
    setFiltros,
    resetFiltros,
    resetReporteData,
    selectReporteData,
    selectFiltros,
    selectIsLoading,
    selectReporteError,
} from "../../../store/slices/reporteChecadorFacial/reporteChecadorFacialSlice";

export const ReporteChecadorFacial = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);

    const reporteData = useSelector(selectReporteData);
    const filtros = useSelector(selectFiltros);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectReporteError);

    // 🚀 ESTADOS PARA EL FILTRO LOCAL
    const [hasSearched, setHasSearched] = useState(false);
    // Guarda el texto de búsqueda del input
    const [searchText, setSearchText] = useState('');
    // Guarda los datos que se van a mostrar/exportar (ya filtrados)
    const [dataToRenderAndExport, setDataToRenderAndExport] = useState([]);

    // --- SINCRONIZACIÓN DE DATOS ---
    // Este useEffect se ejecuta cuando reporteData (de Redux) cambia
    useEffect(() => {
        // Inicialmente, los datos a mostrar son todos los datos de Redux.
        setDataToRenderAndExport(reporteData);

        // Si ya hay un texto de búsqueda escrito, aplicamos el filtro inmediatamente sobre los nuevos datos.
        if (searchText) {
            applySearchFilter(reporteData, searchText);
        }
    }, [reporteData]); // Dependencia clave: cuando Redux actualiza reporteData

    // --- CÓDIGO INICIAL (Permanecen sin cambios) ---
    const fetchReporte = useCallback((currentFiltros = {}) => {
        dispatch(startLoadingReporteChecador(currentFiltros));
        setHasSearched(true);
    }, [dispatch]);

    useEffect(() => {
        dispatch(resetFiltros());
        // Limpiamos el filtro local al cargar el componente
        return () => {
            dispatch(resetReporteData());
        };
    }, [dispatch]);

    const isSearchDisabled = () => {
        return !filtros.fechaInicio || !filtros.fechaFin;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFiltros({ [name]: value }));
    };

    const handleSearch = () => {
        if (isSearchDisabled()) {
            Swal.fire({
                icon: 'error',
                title: 'Error en filtros',
                text: 'Debes seleccionar ambas fechas.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        // Limpiamos el filtro local de texto al hacer una nueva búsqueda de rango de fechas
        setSearchText('');
        fetchReporte(filtros);
    };

    const handleClearFilters = () => {
        dispatch(resetFiltros());
        dispatch(resetReporteData());
        setHasSearched(false);
        setSearchText(''); // Limpiar texto de búsqueda
        setDataToRenderAndExport([]); // Limpiar datos de la vista
        setSearchText('')
    };

    // --- FUNCIÓN CENTRAL DE FILTRADO ---
    const applySearchFilter = useCallback((data, text) => {
        const lowerText = text.toLowerCase().trim();

        if (!lowerText) {
            setDataToRenderAndExport(data);
            return;
        }

        const filterRecords = data.filter(record => {
            // 🚀 Solución del TypeError y búsqueda en múltiples campos
            const codigo = record.codigo ? String(record.codigo).toLowerCase() : '';
            const nombreTra = record.nombreTra ? record.nombreTra.toLowerCase() : '';
            const supervisor = record.supervisor ? record.supervisor.toLowerCase() : '';
            const campo = record.supervisor ? record.campo.toLowerCase() : '';
            // Asegúrate de incluir todos los campos relevantes para la búsqueda, 
            // aunque el placeholder solo mencione 3.

            return (
                codigo.includes(lowerText) ||
                nombreTra.includes(lowerText) ||
                supervisor.includes(lowerText) ||
                campo.includes(lowerText)
                // Aquí podrías agregar más campos si fuera necesario:
                // record.campo.toLowerCase().includes(lowerText)
            );
        });

        setDataToRenderAndExport(filterRecords);
    }, []);

    // --- MANEJADOR DEL INPUT DE BÚSQUEDA ---
    const handleChange = (e) => {
        const newSearchText = e.target.value;
        setSearchText(newSearchText); // 1. Guardar el texto en el estado local

        // 2. Aplicar el filtro sobre los datos originales de Redux (`reporteData`)
        applySearchFilter(reporteData, newSearchText);
    };

    // --- RENDERIZADO ---
    // La condición de exportación ahora usa dataToRenderAndExport
    const shouldEnableExportButton = !isLoading && !error && dataToRenderAndExport.length > 0 && hasSearched;

    const extraerNumeroSerie = (descripcion) => {
        if (typeof descripcion !== 'string' || !descripcion.includes(' - ')) {
            return descripcion; // Devuelve la original o 'N/A' si no tiene el formato esperado
        }

        const partes = descripcion.split(' - ');

        if (partes.length >= 3) {
            return partes[1].trim();
        }

        return descripcion; // Si no hay 3 partes, devuelve la cadena original.
    };

    return (
        <>
            <style type="text/css">
                {`
                /* ... tus estilos CSS se mantienen ... */
                .table tbody tr:hover {
                    --bs-table-hover-bg: #d19ff9 !important; /* Color que tenías */  
                }

                /* Estilo para las filas al pasar el ratón */
                .table tbody tr:hover {
                    background-color: #d19ff9 !important; /* Color que tenías */
                    /* cursor: pointer; */
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
                .table-responsive tbody td {
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
                    <strong>Reporte Checador Facial</strong>
                </div>

                <div>
                    <label className="form-label m-3">Consulta de información de checadores faciales ubicados en campo.</label>
                </div>

                <div className="container-fluid d-flex justify-content-between flex-wrap align-items-end pt-1 pb-1">

                    <div className="d-flex flex-wrap align-items-end">

                        {/* Fecha Inicio */}
                        <div className="mb-2 me-3">
                            <div><p className="m-0 me-3 sizeLetra">Fecha Inicio:</p></div>
                            <input className="form-control" type="date" name="fechaInicio" value={filtros.fechaInicio || ''} onChange={handleFilterChange} />
                        </div>

                        {/* Fecha Fin */}
                        <div className="mb-2 me-3">
                            <div><p className="m-0 me-3 sizeLetra">Fecha fin:</p></div>
                            <input className="form-control" type="date" name="fechaFin" value={filtros.fechaFin || ''} onChange={handleFilterChange} />
                        </div>

                        {/* Botones de Acción (alineados con los inputs) */}
                        <div className="mb-2 me-3 d-flex">
                            <Button className="btn btn-warning rounded-2 me-2" onClick={handleSearch} disabled={isLoading}>
                                {isLoading ? 'Buscando...' : 'Buscar'}
                            </Button>
                            <Button className="btn btn-secondary rounded-2" onClick={handleClearFilters} disabled={isLoading} >
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>

                    <div className="mb-2 ms-auto ms-2" style={{ width: '500px' }}>
                        <div><p className="m-0 me-3 sizeLetra">Buscar en resultados:</p></div>
                        <input
                            type="text"
                            className="form-control"
                            id="miInput"
                            onChange={handleChange}
                            value={searchText}
                            placeholder="Buscar por código, supervisor, trabajador o campo..."
                            // Añadimos un estilo inline para forzar el ancho del input si fuera necesario
                            style={{ width: '500px' }}
                            disabled={isLoading || !reporteData.length}
                        />
                    </div>
                </div>

                {/* --- Visualización de Resultados y Errores --- */}
                {isLoading && hasSearched && <p>Cargando reporte...</p>}
                {error && hasSearched && <p style={{ color: 'red' }}>Error al cargar: {error}</p>}

                {/* 🚀 TABLA VISIBLE: Usa dataToRenderAndExport */}
                {!isLoading && !error && dataToRenderAndExport.length > 0 && hasSearched && (
                    <div className="table-responsive" style={{ maxHeight: '450px' }}>
                        <table className="table table-striped table-hover">
                            <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                                <tr>
                                    <th>Código</th>
                                    <th>Fecha</th>
                                    <th>Entrada</th>
                                    <th>Salida</th>
                                    <th>Supervisor</th>
                                    <th>Nombre del Trabajador</th>
                                    <th>Campo del Trabajador</th>
                                    <th>Genero</th>
                                    <th>Serie Reloj</th>
                                    <th>Dispositivo ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 🚀 Usamos dataToRenderAndExport */}
                                {dataToRenderAndExport.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.codigo}</td>
                                        <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                        <td>{item.horaEntrada || 'N/A'}</td>
                                        <td>{item.horaSalida || 'N/A'}</td>
                                        <td>{item.supervisor || 'N/A'}</td>
                                        <td>{item.nombreTra || 'N/A'}</td>
                                        <td>{item.campo || 'N/A'}</td>
                                        <td>{item.sexo === 'F' ? 'Femenino' : item.sexo === 'M' ? 'Masculino' : 'N/A'}</td>
                                        <td>{extraerNumeroSerie(item.descripcion) || 'N/A'}</td>
                                        <td>{item.idDispositivo || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 🚀 Mensaje "No hay datos para mostrar" si el filtro local vació la tabla */}
                {!isLoading && !error && dataToRenderAndExport.length === 0 && hasSearched && (
                    <p className="mt-4">
                        {searchText
                            ? `No se encontraron resultados para "${searchText}".`
                            : 'No hay datos para mostrar con los filtros aplicados.'
                        }
                    </p>
                )}

                {/* Mensaje inicial antes de la primera búsqueda */}
                {!isLoading && !error && !hasSearched && (
                    <p className="mt-4">Por favor, selecciona los filtros y haz clic en "Buscar" para ver el reporte.</p>
                )}

                <hr />

                {/* // Exportar a Excel */}
                <DownloadTableExcel filename="Checador Facial" sheet="Facial" currentTableRef={tableRef.current}>
                    {/* 1. OverlayTrigger envuelve el botón */}
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-exportar">Exportar datos a Excel ({dataToRenderAndExport.length})</Tooltip>} delay={{ show: 200, hide: 100 }}>
                        <Button className="btn btn-success rounded-2">
                            <i className="fas fa-file-excel fa-lg"></i> Exportar ({dataToRenderAndExport.length})
                        </Button>
                    </OverlayTrigger>
                </DownloadTableExcel>

                {/* TABLA OCULTA: Usa dataToRenderAndExport para la exportación */}
                <table ref={tableRef} style={{ display: 'none' }}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Supervisor</th>
                            <th>Nombre del Trabajador</th>
                            <th>Campo del Trabajador</th>
                            <th>Genero</th>
                            <th>Serie Reloj</th>
                            <th>Dispositivo ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🚀 Usamos dataToRenderAndExport en la tabla oculta para exportar solo lo filtrado */}
                        {dataToRenderAndExport.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.codigo}</td>
                                <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                <td>{item.horaEntrada || 'N/A'}</td>
                                <td>{item.horaSalida || 'N/A'}</td>
                                <td>{item.supervisor || 'N/A'}</td>
                                <td>{item.nombreTra || 'N/A'}</td>
                                <td>{item.campo || 'N/A'}</td>
                                <td>{item.sexo === 'F' ? 'Femenino' : item.sexo === 'M' ? 'Masculino' : 'N/A'}</td>
                                <td>{item.descripcion || 'N/A'}</td>
                                <td>{item.idDispositivo || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};