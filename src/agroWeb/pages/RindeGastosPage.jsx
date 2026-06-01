import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DownloadTableExcel } from "react-export-table-to-excel";

import { clearSyncState } from '../../store/slices/rindeGastos/rindeGastosSlice';
import { startSyncManualGastos, startSyncCatalogoUsuarios, startObtenerPolizaPeriodo } from '../../store/slices/rindeGastos/thunks';

export const RindeGastosPage = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);

    // Consumimos el estado global desde el slice de Redux
    const {
        loadingGastos,
        loadingUsuarios,
        isLoadingPoliza,
        resPoliza,
        resGastos,
        resUsuarios,
        error
    } = useSelector((state) => state.rindeGastos);

    // Estados de control del formulario de rango de fechas
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // Estados para el filtro local
    const [hasSearched, setHasSearched] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dataToRenderAndExport, setDataToRenderAndExport] = useState([]);

    // Limpieza al desmontar la pantalla
    // En tu RindeGastosPage.jsx
    useEffect(() => {
        // 1. Limpia al entrar por si acaso quedó algún loader colgado en Redux
        dispatch(clearSyncState());

        return () => {
            // 2. Limpia al salir de la pantalla
            dispatch(clearSyncState());
        };
    }, [dispatch]);

    // Sincronización de datos al recibir respuesta del SP
    useEffect(() => {
        const polizaData = resPoliza || [];
        setDataToRenderAndExport(polizaData);

        if (searchText) {
            applySearchFilter(polizaData, searchText);
        }
    }, [resPoliza]);

    // Función de filtrado local usando las llaves del JSON corregido de la API
    const applySearchFilter = useCallback((data, text) => {
        const lowerText = text.toLowerCase().trim();

        if (!lowerText) {
            setDataToRenderAndExport(data);
            return;
        }

        const filterRecords = data.filter(row => {
            const cuenta = row.c_codigo_cta ? String(row.c_codigo_cta).toLowerCase() : '';
            const concepto = row.v_nombre_pde ? String(row.v_nombre_pde).toLowerCase() : '';
            const referencia = row.referencia_seg ? String(row.referencia_seg).toLowerCase() : '';
            const uuid = row.uuid_factura ? String(row.uuid_factura).toLowerCase() : '';
            const factura = row.factura ? String(row.factura).toLowerCase() : '';
            const idGasto = row.id_gasto_rg ? String(row.id_gasto_rg).toLowerCase() : '';

            return (
                cuenta.includes(lowerText) ||
                concepto.includes(lowerText) ||
                referencia.includes(lowerText) ||
                uuid.includes(lowerText) ||
                factura.includes(lowerText) ||
                idGasto.includes(lowerText)
            );
        });

        setDataToRenderAndExport(filterRecords);
    }, []);

    // Manejador del input de búsqueda
    const handleChange = (e) => {
        const newSearchText = e.target.value;
        setSearchText(newSearchText);
        applySearchFilter(resPoliza || [], newSearchText);
    };

    // Ejecutar consulta del SP
    const handleConsultarPoliza = () => {
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'error',
                title: 'Error en filtros',
                text: 'Debes seleccionar tanto la Fecha de Inicio como la Fecha Fin.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        setSearchText('');
        setHasSearched(true);
        dispatch(startObtenerPolizaPeriodo({ fechaInicio, fechaFin }));
    };

    // Limpiar filtros y estados
    const handleClearFilters = () => {
        dispatch(clearSyncState());
        setFechaInicio('');
        setFechaFin('');
        setHasSearched(false);
        setSearchText('');
        setDataToRenderAndExport([]);
    };

    // Helper para formatear montos monetarios o reflejar vacíos de forma limpia
    const formatMonto = (val) => {
        if (val === null || val === undefined || val === '') return '—';
        const num = Number(val);
        return isNaN(num) || num === 0 ? '—' : `$${num.toFixed(2)}`;
    };

    // Helper para porcentajes o tasas distributivas decimales
    const formatDecimal = (val, maxDigits = 4) => {
        if (val === null || val === undefined || val === '') return '—';
        const num = Number(val);
        return isNaN(num) ? '—' : num.toFixed(maxDigits);
    };

    // Helper para cadenas de texto que puedan venir vacías
    const formatText = (val) => {
        if (val === null || val === undefined || String(val).trim() === '') return 'NULL';
        return val;
    };

    // 🆕 ESTADOS NUEVOS E INDEPENDIENTES SOLO PARA EL CARD DE SINCRONIZACIÓN
    const [fechaInicioSync, setFechaInicioSync] = useState('');
    const [fechaFinSync, setFechaFinSync] = useState('');

    // Manejador para lanzar la sincronización manual usando sus propias fechas
    const handleSincronizarGastos = () => {
        // 💡 Ahora valida las variables independientes del Card
        if (!fechaInicioSync || !fechaFinSync) {
            Swal.fire({
                icon: 'error',
                title: 'Fechas de sincronización requeridas',
                text: 'Por favor, selecciona el rango de fechas dentro del módulo para iniciar la sincronización.',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        // Despachamos el thunk enviando el rango del módulo
        dispatch(startSyncManualGastos({ fechaInicio: fechaInicioSync, fechaFin: fechaFinSync }));
    };

    return (
        <>
            <style type="text/css">
                {`
          .table tbody tr:hover {
            --bs-table-hover-bg: #d19ff9 !important; 
          }
          .table tbody tr:hover {
            background-color: #d19ff9 !important;
          }
          .table thead th {
            padding-left: 8px;
            padding-right: 8px;
            font-size: 13px;
            font-weight: bold;
            background-color: #7c30b8;
            color: white;
            text-align: center;
            vertical-align: middle;
          }
          .table tbody td {
            padding-left: 8px;
            padding-right: 8px;
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
          }
          .table thead th:first-child { border-top-left-radius: 8px; }
          .table thead th:last-child { border-top-right-radius: 8px; }
          .table-responsive tbody td { min-height: 30px; padding-left: 8px; padding-right: 8px; }
          .table tbody tr:last-child td:first-child { border-bottom-left-radius: 8px; }
          .table tbody tr:last-child td:last-child { border-bottom-right-radius: 8px; }
          .sizeLetra { font-size: 13px; }
          .truncate-text { max-width: 160px; }
        `}
            </style>

            <br />
            <br />
            <div
                id="pagesContainer"
                className="container-fluid rounded-3 p-4 mt-2 animate__animated animate__fadeIn"
                style={{ background: 'white', marginBottom: '40px' }}
            >
                {/* Encabezado Principal */}
                <div
                    className="rounded-3 shadow-sm mb-4"
                    style={{
                        background: '#7c30b8',
                        color: 'white',
                        padding: '8px 12px',
                        textAlign: 'center',
                    }}
                >
                    <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>
                        Póliza de Rinde Gastos
                    </h5>
                </div>

                {/* Alerta de error del servidor */}
                {error && (
                    <div className="alert alert-danger shadow-sm d-flex align-items-center rounded-3 mb-4" role="alert">
                        <span className="fw-bold">⚠️ Error: </span>
                        <span className="ms-2">
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </span>
                    </div>
                )}

                {/* Contenedor de Módulos (Grid original de tus tarjetas) */}
                <div className="row g-4 mb-4">

                    {/* MÓDULO 1: GASTOS MASIVOS */}
                    <div className="col-md-6">
                        <div
                            className="rounded-3 p-4 h-100 shadow-sm border"
                            style={{ background: '#f8f9fa', borderTop: '4px solid #7c30b8' }}
                        >
                            <h6 className="fw-bold text-dark mb-2">Sincronizar Gastos Masivos</h6>
                            <p className="text-secondary small mb-3">
                                Descarga los comprobantes del rango seleccionado, extrayendo datos fiscales directamente a la base de datos.
                            </p>

                            {/* 🗓️ INPUTS TOTALMENTE INDEPENDIENTES */}
                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label className="m-0 text-muted fw-bold" style={{ fontSize: '11px' }}>Fecha Inicio Sync:</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="date"
                                        value={fechaInicioSync} // 💡 Vinculado al nuevo estado
                                        onChange={(e) => setFechaInicioSync(e.target.value)}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="m-0 text-muted fw-bold" style={{ fontSize: '11px' }}>Fecha Fin Sync:</label>
                                    <input
                                        className="form-control form-control-sm"
                                        type="date"
                                        value={fechaFinSync} // 💡 Vinculado al nuevo estado
                                        onChange={(e) => setFechaFinSync(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Caja de Estado / Resultados */}
                            <div
                                className="rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center text-center border bg-white"
                                style={{ minHeight: '90px' }}
                            >
                                {loadingGastos && (
                                    <div className="text-warning small fw-bold animate__animated animate__pulse animate__infinite">
                                        ⏳ Sincronizando páginas desde la API y afectando BD... Por favor, espera.
                                    </div>
                                )}

                                {resGastos && !loadingGastos && (
                                    <div className="w-100 text-start animate__animated animate__fadeIn">
                                        <div className="text-success fw-bold small mb-2 text-center">
                                            🎉 {resGastos.mensaje || 'Sincronizado'}
                                        </div>
                                        <div className="row g-2 text-center">
                                            <div className="col-4">
                                                <div className="bg-light rounded p-2 border">
                                                    <div className="fw-bold text-dark small">{resGastos.totalInsertados ?? 0}</div>
                                                    <span className="text-muted d-block" style={{ fontSize: '10px' }}>Nuevos</span>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="bg-light rounded p-2 border">
                                                    <div className="fw-bold text-dark small">{resGastos.omitidosPorExistir ?? 0}</div>
                                                    <span className="text-muted d-block" style={{ fontSize: '10px' }}>Omitidos</span>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="bg-light rounded p-2 border">
                                                    <div className="fw-bold text-dark small">{resGastos.paginas ?? 0}</div>
                                                    <span className="text-muted d-block" style={{ fontSize: '10px' }}>Páginas</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!loadingGastos && !resGastos && (
                                    <span className="text-muted small fw-medium">Selecciona fechas e inicia transferencia</span>
                                )}
                            </div>

                            <button
                                className="btn text-white w-100 fw-bold shadow-sm"
                                onClick={handleSincronizarGastos}
                                disabled={loadingGastos || loadingUsuarios || isLoadingPoliza}
                                style={{
                                    background: '#7c30b8',
                                    opacity: loadingGastos || loadingUsuarios || isLoadingPoliza ? 0.6 : 1,
                                    padding: '10px'
                                }}
                            >
                                {loadingGastos ? 'Sincronizando Gastos...' : 'Iniciar Sincronización de Gastos'}
                            </button>
                        </div>
                    </div>

                    {/* MÓDULO 2: CATÁLOGO DE USUARIOS */}
                    <div className="col-md-6">
                        <div
                            className="rounded-3 p-4 h-100 shadow-sm border"
                            style={{ background: '#f8f9fa', borderTop: '4px solid #198754' }}
                        >
                            <h6 className="fw-bold text-dark mb-2">Sincronizar Catálogo de Usuarios</h6>
                            <p className="text-secondary small mb-3" style={{ minHeight: '40px' }}>
                                Descarga de usuarios registrados en el sistema Rinde Gastos.
                            </p>

                            {/* Caja de Estado / Resultados */}
                            <div
                                className="rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center text-center border bg-white"
                                style={{ minHeight: '90px' }}
                            >
                                {loadingUsuarios && (
                                    <div className="text-success small fw-bold animate__animated animate__pulse animate__infinite">
                                        ⏳ Actualizando base de datos de usuarios... Espera un momento.
                                    </div>
                                )}

                                {resUsuarios && !loadingUsuarios && (
                                    <div className="w-100 text-start animate__animated animate__fadeIn">
                                        <div className="text-success fw-bold small mb-2 text-center">
                                            🎉 {resUsuarios.mensaje || 'Sincronizado'}
                                        </div>
                                        <div className="row g-2 text-center justify-content-center">
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 border">
                                                    <div className="fw-bold text-success small">{resUsuarios.nuevosInsertados ?? 0}</div>
                                                    <span className="text-muted d-block" style={{ fontSize: '10px' }}>Nuevos</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light rounded p-2 border">
                                                    <div className="fw-bold text-dark small">{resUsuarios.registrosActualizados ?? 0}</div>
                                                    <span className="text-muted d-block" style={{ fontSize: '10px' }}>Actualizados</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!loadingUsuarios && !resUsuarios && (
                                    <span className="text-muted small fw-medium">Listo para mapear empleados</span>
                                )}
                            </div>

                            <button
                                className="btn btn-success w-100 fw-bold shadow-sm"
                                onClick={() => dispatch(startSyncCatalogoUsuarios())}
                                disabled={loadingGastos || loadingUsuarios || isLoadingPoliza}
                                style={{
                                    opacity: loadingGastos || loadingUsuarios || isLoadingPoliza ? 0.6 : 1,
                                    padding: '10px'
                                }}
                            >
                                {loadingUsuarios ? 'Actualizando Usuarios...' : 'Sincronizar Catálogo Usuarios'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Sección de Filtros de Fecha y Cuadro de Búsqueda Local */}
                <div className="container-fluid pt-1 pb-1">
                    <div className="row align-items-end g-2">
                        <div className="col-xl-9 col-lg-12 d-flex flex-wrap align-items-end">
                            <div className="me-2" style={{ width: '140px' }}>
                                <p className="m-0 sizeLetra">Fecha Inicio:</p>
                                <input
                                    className="form-control form-control-sm"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="me-2" style={{ width: '140px' }}>
                                <p className="m-0 sizeLetra">Fecha fin:</p>
                                <input
                                    className="form-control form-control-sm"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                            </div>
                            <div className="d-flex">
                                <Button
                                    className="btn btn-warning btn-sm rounded-2 me-1"
                                    onClick={handleConsultarPoliza}
                                    disabled={isLoadingPoliza || loadingGastos || loadingUsuarios}
                                >
                                    {isLoadingPoliza ? '...' : 'Generar Póliza'}
                                </Button>
                                <Button
                                    className="btn btn-secondary btn-sm rounded-2"
                                    onClick={handleClearFilters}
                                    disabled={isLoadingPoliza || loadingGastos || loadingUsuarios}
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>

                        {/* Cuadro de búsqueda predictiva / local */}
                        <div className="col-xl-3 col-lg-12 ms-auto">
                            <p className="m-0 sizeLetra">Buscar en resultados:</p>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                onChange={handleChange}
                                value={searchText}
                                placeholder="Filtra por cuenta, concepto, ID Gasto..."
                                style={{ width: '100%' }}
                                disabled={isLoadingPoliza || !(resPoliza && resPoliza.length > 0)}
                            />
                        </div>
                    </div>
                </div>

                <hr />

                {/* Estados de carga de la póliza */}
                {isLoadingPoliza && hasSearched && <p className="text-muted ps-1">Cargando registros contables...</p>}

                {/* 📊 TABLA DE RESULTADOS VINCULADA ESTRICTAMENTE CON TU JSON */}
                {!isLoadingPoliza && dataToRenderAndExport.length > 0 && hasSearched && (
                    <div className="table-responsive" style={{ maxHeight: '400px' }}>
                        {/* 1. Aseguramos text-start a nivel general de la tabla */}
                        <table className="table table-striped table-hover align-middle mb-0 text-start me-auto">
                            <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                                {/* 2. FORZADO: Agregamos text-start aquí para alinear los <th> obligatoriamente a la izquierda */}
                                <tr>
                                    <th className="text-start">Secuencia</th>
                                    <th className="text-start">Cuenta</th>
                                    <th className="text-start">Debe</th>
                                    <th className="text-start">Haber</th>
                                    <th className="text-start">Referencia</th>
                                    <th className="text-start">Cierre</th>
                                    <th className="text-start">UUID</th>
                                    <th className="text-start">ID Gasto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataToRenderAndExport.map((row, index) => (
                                    <tr key={`poliza-${index}-${row.id_gasto_rg}-${row.c_secuencia_pde}`} className="text-start">
                                        <td>{row.c_secuencia_pde ?? ''}</td>
                                        <td>{row.c_codigo_cta ?? ''}</td>

                                        <td>{row.debe != null ? formatMonto(row.debe) : ''}</td>
                                        <td>{row.haber != null ? formatMonto(row.haber) : ''}</td>

                                        <td>{row.referencia_seg ? formatText(row.referencia_seg) : ''}</td>
                                        <td>{row.cierre_semana ? formatText(row.cierre_semana) : ''}</td>

                                        <td>{row.uuid_factura ? formatText(row.uuid_factura) : ''}</td>

                                        <td>{row.id_gasto_rg ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mensajes Condicionales de Búsqueda */}
                {!isLoadingPoliza && dataToRenderAndExport.length === 0 && hasSearched && (
                    <p className="mt-4 text-secondary fw-bold ps-1">
                        {searchText
                            ? `No se encontraron resultados para "${searchText}".`
                            : 'No hay datos para mostrar con los filtros aplicados.'
                        }
                    </p>
                )}

                {!isLoadingPoliza && !hasSearched && (
                    <p className="mt-4 text-muted ps-1">Por favor, selecciona los filtros de fechas y haz clic en "Buscar" para generar la vista.</p>
                )}

                <hr />

                {/* Botón de exportación inteligente */}
                <DownloadTableExcel filename="Poliza RindeGastos" sheet="Asientos" currentTableRef={tableRef.current}>
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-exportar">Exportar datos completos a Excel ({dataToRenderAndExport.length})</Tooltip>}
                        delay={{ show: 200, hide: 100 }}
                    >
                        <Button
                            className="btn btn-success rounded-2"
                            disabled={isLoadingPoliza || !hasSearched || dataToRenderAndExport.length === 0}
                        >
                            <i className="fas fa-file-excel fa-lg me-1"></i> Exportar ({dataToRenderAndExport.length})
                        </Button>
                    </OverlayTrigger>
                </DownloadTableExcel>

                {/* Tabla oculta estructurada exactamente igual que la respuesta JSON para Excel */}
                <table ref={tableRef} style={{ display: 'none' }}>
                    <thead>
                        <tr>
                            <th>Secuencia</th>
                            <th>Cuenta</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Referencia</th>
                            <th>Cierre</th>
                            <th>UUID</th>
                            <th>ID Gasto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataToRenderAndExport.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.c_secuencia_pde}</td>
                                <td>{row.c_codigo_cta}</td>
                                <td>{row.debe || 0}</td>
                                <td>{row.haber || 0}</td>
                                <td>{row.referencia_seg || 'NULL'}</td>
                                <td>{row.cierre_semana || 'NULL'}</td>
                                <td>{row.uuid_factura || 'NULL'}</td>
                                <td>{row.id_gasto_rg}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};