import { useState } from 'react';
import { RouterList } from '../components/Routes/RoutesList';
import { AddRoute, ModRoute, DelRoute } from '../components/Routes';
import { useDispatch } from 'react-redux';
import { getRoutes } from '../../store/slices/rutas';

export const RutasPage = () => {

	//.........................
	//En esta seccion entre pountos puede que se pueda mejorar el codigo por medio de thunks para el funcionamiento de popups y evitas el duplicado de cdogio con dicha mejora
	const dispatch = useDispatch();
	const [searchTerm, setSearchTerm] = useState('');
	const [isPopupOpen, setIsPopupOpen] = useState(null); // 👈 Inicializar en null


	const openRoutePopup = (routePopupComponent) => {
		setIsPopupOpen(routePopupComponent);
	};

	const closeRoutePopup = async () => {
		setIsPopupOpen(null);
		await dispatch(getRoutes());
	};
	//.......................................

	const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

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

			<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
				<div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
					<strong>Rutas</strong>
				</div>

				<div className="d-flex flex-wrap align-items-end m-1">
					<div style={{ marginTop: '1px' }}>
						<label className="form-label m-1">Registro y consulta de Rutas.</label>
					</div>

					<div className="mb-2 ms-auto ms-5" style={{ width: '500px' }}>
						<div><p className="m-1 me-3 sizeLetra">Buscar:</p></div>
						<input type="text" className="form-control" placeholder="Buscar por ruta..." style={{ width: '500px' }}  value={searchTerm} onChange={handleSearchChange} />
					</div>
				</div>
				<div className="table-responsive" style={{ maxHeight: '450px' }}>
					<table className="table table-striped table-hover">{/* Puedes añadir tus propias clases CSS */}
						<thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
							<tr>
								<th scope="col">No.</th>
								<th scope="col">Ruta</th>
								<th scope="col">Ruta Activa</th>
								<th scope="col">Kilometros</th>
								<th scope="col">Costo</th>
								<th scope="col">Zona</th>
								<th scope="col">Usuario Creador</th>
								<th scope="col">Usuario Modificador</th>
								<th scope="col" className="text-center">Acciones</th>
							</tr>
						</thead>
						<tbody>
							<RouterList
								openRoutePopup={openRoutePopup}
								closeRoutePopup={closeRoutePopup}
								searchTerm={searchTerm}
							/>
						</tbody>
					</table>
				</div>
				<hr></hr>
				<div className="ms-2  mb-1 mt-2">
					<button className="btn btn-warning rounded-2 m-1" onClick={() => openRoutePopup(<AddRoute onClose={closeRoutePopup} />)}><i className="fas fa-route fa-lg"></i> Agregar Nueva Ruta</button>
					{/* <button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openRoutePopup(<ModRoute onClose={ closeRoutePopup }/>) }>Modificar</button> */}
					{/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openRoutePopup(<DelRoute onClose={ closeRoutePopup }/>) }>Eliminar</button> */}
				</div>

				{isPopupOpen}
			</div>
		</>
	)
}
