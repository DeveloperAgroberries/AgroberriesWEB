import React from 'react'

export const ReporteKilometrajeDiario = () => {

    return (
        <>
            <style type="text/css">
                {`
                    /* Estilos para la tabla HTML nativa */

                    .table tbody tr:hover {
                        --bs-table-hover-bg: #d19ff9 !important; /* Color que tenías */  
                    }

                    /* Estilo para las filas al pasar el ratón */
                    .table tbody tr:hover {
                        background-color: #d19ff9 !important; /* Color que tenías */
                        {/* cursor: pointer; */}
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
                    .mi-tabla-activos tbody td {
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

            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Reporte Diario de Kilometraje</strong>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label className="form-label m-1">Consulta de información del kilometraje diariamente registrado.</label>
                </div>

                <div className="container-fluid overflow-auto m-2" style={{ display: "flex" }}>
                    <div className="mb-2 me-3">
                        <div><p className="m-1 me-3 sizeLetra">Fecha Inicio:</p></div>
                        <div><input className="form-control" type="date" ></input></div>
                    </div>

                    <div className="mb-2 me-3">
                        <div><p className="m-1 me-3 sizeLetra">Fecha Fin:</p></div>
                        <div><input className="form-control" type="date"></input></div>
                    </div>

                    <div className="mb-2 me-2">
                        <button className="btn btn-warning rounded-2 m-1 mt-4 ">Buscar</button>
                    </div>

                    <div className="mb-2 me-2">
                        <button className="btn btn-secondary rounded-2 m-1 mt-4 "  >Limpiar Filtros</button>
                    </div>

                    <div className="mb-2 ms-auto ms-2" style={{ width: '500px' }}>
                        <div><p className="m-0 me-3 sizeLetra">Buscar en resultados:</p></div>
                        <input type="text" className="form-control" placeholder="Buscar por placas..." style={{ width: '500px' }} />
                    </div>

                </div>

                <div className="table-responsive" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover" >
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                <th scope="col">No.</th>
                                <th scope="col">Placas</th>
                                <th scope="col">Nombre Ruta</th>
                                <th scope="col">Nombre Chofer</th>
                                <th scope="col">Tipo de Unidad</th>
                                <th scope="col">Km - InicioRuta</th>
                                <th scope="col">Km - FinRuta</th>
                                <th scope="col">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* <ReporteBaseList isSearchTriggered={isSearchTriggered} searchTerm={searchTerm} setTotalRecords={setTotalRecords} /> */}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}
