import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { useForm } from '../../../hooks';
import { RanchListForSelect } from '../RanchListForSelect';
import { RouteListForSelect } from '../RouteListForSelect';
import { WeekListForSelect } from '../WeekListForSelect';
import { getRoutes } from '../../../store/slices/rutas';
import { getFields } from '../../../store/slices/fields/thunks';
import dayjs from 'dayjs';
import { startAddNewRouteBudget } from '../../../store/slices/routesBudget';

export const AddRouteBudget = ({ onClose }) => {
	const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
	const { fields = [] } = useSelector((state) => state.fields);
	const { routes = [] } = useSelector((state) => state.routes);
	const [ errorMessage, setErrorMessage ] = useState('');
    const date = new Date()

	useEffect(() => {
		dispatch(getRoutes());
		dispatch(getFields());
	},[]);

    const {week, field, route, onInputChange} = useForm({
		week: '',
        field: '',
        route: ''
    });

    const onSubmit = async( event ) =>{
        event.preventDefault();

        if(week === '' || field === '' || route === ''){
            setErrorMessage('Revisa que los campos contengan datos');
			return;
        }else{
			const selectedRanch = fields.find(f => f.cCodigoCam.trim() === field.trim());
			const selectedRoute = routes.find(r => parseInt(r.cControlRut) === parseInt(route));

			if (!selectedRanch || !selectedRoute) {
                setErrorMessage('Campo o ruta no válidos');
                return;
            }

            const routeForAdd = {
                cCodigoSem: week,
				cCodigoCam: selectedRanch.cCodigoCam,
                vNombreCam: selectedRanch.vNombreCam,
				cControlRut: selectedRoute.cControlRut,
                vDescripcionRut: selectedRoute.vDescripcionRut,
                cCodigoUsu: user?.id,
                dCreacionPru: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
            };

			setErrorMessage('');
			const success = await dispatch(startAddNewRouteBudget(routeForAdd));
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al agregar la ruta. Intente nuevamente.');
			}
    	}
  	};

	return (
	    <div className="popup-container">
	      	<div className="rounded-4 popup">
	        	<h2>Agregar Ruta a Presupuesto Semanal</h2>
	        	<div className='container'>
	          		<form>
			  			<div className="mb-3">
	            		  	<label className="form-label">Semana</label>
	            		  	<select required className="form-select" name='week' value={ week } onChange={ onInputChange }>
	            		    	<option hidden value="">Seleccion</option>
	            		    	<WeekListForSelect/>
	            		  	</select>
	            		</div>

						<div className="mb-3">
	              			<label className="form-label">Campo</label>
	              			<select required className="form-select" name='field' value={ field } onChange={ onInputChange }>
	              				<option hidden value="">Seleccion</option>
	              			  	<RanchListForSelect/>
	              			</select>
	            		</div>

	            		<div className="mb-3">
	            		  	<label className="form-label">Ruta</label>
	            		  	<select required className="form-select" name='route' value={ route } onChange={ onInputChange }>
	            		    	<option hidden value="">Seleccion</option>
	            		    	<RouteListForSelect/>
	            		  	</select>
	            		</div>
	          		</form>
	        	</div>

				{errorMessage && (
	        		<div className="alert alert-danger" role="alert">
	            		{errorMessage}
	          		</div>
	        	)}
			
	        	<div className='container mb-1 mt-2'>
	          		<button className='btn btn-outline-success rounded-2 m-1'  onClick={ onSubmit }>Guardar</button>
	          		<button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
	        	</div>
	      	</div>
	    </div>
	);
}
