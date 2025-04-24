import { useState } from 'react';
import { RoutesBudgetList } from '../components/RoutesBudget/RoutesBudgetList';
import { AddRouteBudget } from '../components/RoutesBudget/AddRouteBudget';
import { ModRouteBudget } from '../components/RoutesBudget/ModRouteBudget';
import { DelRouteBudget } from '../components/RoutesBudget/DelRouteBudget';
import { useDispatch } from 'react-redux';
import { getRoutesBudget } from '../../store/slices/routesBudget';

export const PresupuestoRutasPage = () => {
  
  //.........................
  //En esta seccion entre pountos puede que se pueda mejorar el codigo por medio de thunks para el funcionamiento de popups y evitas el duplicado de cdogio con dicha mejora
  const dispatch = useDispatch();
  const [isPopupOpen, setIsPopupOpen] = useState(null);

  // useEffect(() => {
  //   // Cargar la lista de presupuestos cuando el componente se monte
  //   dispatch(getRoutesBudget());
  // }, [dispatch]);

  const openPopup = (popupComponent) => {
    setIsPopupOpen(popupComponent);
  };

  const closePopup = async () => {
    setIsPopupOpen(null);
    await dispatch(getRoutesBudget());
  };
//.......................................

	return (
    	<>
      		<hr/>
      		<hr/>
      		<hr/>

      		<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
        		<h1 className='text-center text-black text text'>Presupuesto de rutas</h1>
        		<div className="container-fluid overflow-auto" id="containerPagesTable">
					<table className="table table-bordered table-dark table-striped-columns table-hover">
						<thead>
							<tr>
								<th scope="col">No.</th>
								<th scope="col">Semana</th>
								<th scope="col">Rancho</th>
								<th scope="col">Ruta</th>
								<th scope="col">Usuario Creador</th>
								<th scope="col">Fecha de creacion</th>
								<th scope="col">Usuario Modificador</th>
								<th scope="col">Fecha de Modificacion</th>
							</tr>
						</thead>
						<tbody>
							<RoutesBudgetList/>
						</tbody>          
					</table>
        		</div>
            
				<div className="ms-2 mb-1 mt-2">
					<button className="btn btn-outline-success rounded-2 m-1" onClick={ () => openPopup(<AddRouteBudget onClose={ closePopup }/>) }>Agregar</button>
					<button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openPopup(<ModRouteBudget onClose={ closePopup }/>) }>Modificar</button>
					{/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openPopup(<DelRouteBudget onClose={ closePopup }/>) }>Eliminar</button> */}
				</div>

				{isPopupOpen}
    		</div>
    	</>
	);
}
