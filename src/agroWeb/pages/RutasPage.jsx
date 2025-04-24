import { useState } from 'react';
import { RouterList } from '../components/Routes/RoutesList';
import { AddRoute, ModRoute, DelRoute } from '../components/Routes';
import { useDispatch } from 'react-redux';
import { getRoutes } from '../../store/slices/rutas';

export const RutasPage = () => {
  
  //.........................
  //En esta seccion entre pountos puede que se pueda mejorar el codigo por medio de thunks para el funcionamiento de popups y evitas el duplicado de cdogio con dicha mejora
 const dispatch = useDispatch(); 
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openRoutePopup = (routePopupComponent) => {
    setIsPopupOpen(routePopupComponent);
  };

  const closeRoutePopup = async () => {
    setIsPopupOpen(null);
	await dispatch(getRoutes());
  };
//.......................................

	return (
		<>
      		<hr/>
      		<hr/>
      		<hr/>

      		<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
        		<h1 className='text-center text-black text text'> Rutas</h1>
        		<div className="container-fluid overflow-auto" id="containerPagesTable">
          			<table className="table table-bordered table-dark table-striped-columns table-hover">
            			<thead>
              				<tr>
								<th scope="col">No.</th>
								<th scope="col">Ruta</th>
								<th scope="col">Ruta Activa</th>
								<th scope="col">Kilometros</th>
								<th scope="col">Costo</th>
								<th scope="col">Zona</th>
								<th scope="col">Usuario Creador</th>
								<th scope="col">Usuario Modificador</th>
              				</tr>
            			</thead>
            			<tbody>
              				<RouterList/>
            			</tbody>          
          			</table>
        		</div>

      			<div className="ms-2  mb-1 mt-2">
        			<button className="btn btn-outline-success rounded-2 m-1" onClick={ () => openRoutePopup(<AddRoute onClose={ closeRoutePopup }/>) }>Agregar</button>
        			<button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openRoutePopup(<ModRoute onClose={ closeRoutePopup }/>) }>Modificar</button>
        			{/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openRoutePopup(<DelRoute onClose={ closeRoutePopup }/>) }>Eliminar</button> */}
      			</div>
      
				  {isPopupOpen}
    		</div>
		</>
	)
}
