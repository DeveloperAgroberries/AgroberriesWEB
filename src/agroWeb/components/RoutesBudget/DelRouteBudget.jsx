import { useDispatch, useSelector } from "react-redux";
import { useForm } from "../../../hooks";
import { startDeleteRouteBudget } from "../../../store/slices/routesBudget";
import { useState } from "react";

export const DelRouteBudget = ({ onClose }) => {
	const dispatch = useDispatch();
	const { selRoutesBudget = []} = useSelector( (state) => state.selRoutesBudget );
	const [ errorMessage, setErrorMessage ] = useState('');

	const {week, field, route} = useForm({
        week: selRoutesBudget.cCodigoSem,
        field: selRoutesBudget.vNombreCam,
        route: selRoutesBudget.vDescripcionRut
    })

	const onSubmit = async ( event ) =>{
		event.preventDefault();
  
		if(route === '' || week === ''|| field === ''){
			setErrorMessage('Revisa que hayas seleccionado una ruta');
			return;
		}else{
			setErrorMessage('');
			const success = await dispatch( startDeleteRouteBudget(selRoutesBudget.cControlPru) );
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al eliminar la ruta. Intenta nuevamente.')
			}
		}
	}
  
	return (
	  <div className="popup-container">
		<div className="rounded-4 popup">
		  <h2>Eliminar Ruta del Presupueto de Rutas</h2>
		  <hr/>
		  <div className='container'>
			<form>
				<label className="form-label">Ruta Presupuestada</label>
				<div className="mb-3">
					<label className="form-label">Ruta</label>
					<input disabled type="text" className="form-control" aria-describedby="emailHelp" name='route' value={ route } />
			  	</div>
				  <div className="mb-3">
					<label className="form-label">Semana</label>
					<input disabled type="text" className="form-control" aria-describedby="emailHelp" name='week' value={ week } />
			  	</div>
				  <div className="mb-3">
					<label className="form-label">Rancho</label>
					<input disabled type="text" className="form-control" aria-describedby="emailHelp" name='field' value={ field } />
			  	</div>
			</form>
		  </div>

			{errorMessage && (
          		<div className="alert alert-danger" role="alert">
            		{errorMessage}
          		</div>
        	)}
  
		  <h5>Desea eliminar esta Ruta?</h5>
		  <div className='container mb-1 mt-2'>
			<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onSubmit }>Eliminar</button>
			<button className='btn btn-outline-warning rounded-2 m-1' onClick={ onClose }>Regresar</button>
		  </div>
		  
		</div>
	  </div>
	);
}
