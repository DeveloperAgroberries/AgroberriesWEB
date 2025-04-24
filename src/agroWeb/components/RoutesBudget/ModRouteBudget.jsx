import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../auth/context/AuthContext";
import { useForm } from "../../../hooks";
import { WeekListForSelect } from "../WeekListForSelect";
import { RanchListForSelect } from "../RanchListForSelect";
import { RouteListForSelect } from "../RouteListForSelect";
import { getRoutes } from "../../../store/slices/rutas";
import { getFields } from "../../../store/slices/fields/thunks";
import dayjs from 'dayjs';
import '../../../css/Popup.css';
import { startUpdateRouteBudget } from "../../../store/slices/routesBudget";

export const ModRouteBudget = ({ onClose }) => {
    const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
	const { fields = [], isLoading: isLoadingFields, errorMessage: errorFields } = useSelector((state) => state.fields);
	const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
    const { selRoutesBudget = []} = useSelector( (state) => state.selRoutesBudget );
	const [ errorMessage, setErrorMessage] = useState('');
	const [ hide, setHide ] = useState(false);
    const date = new Date()

	useEffect(() => {
        const fetchData = async () => {
            try {
				await Promise.all([dispatch(getRoutes()), dispatch(getFields())]);
			} catch (error) {
				console.error(error);
			}
        };
        fetchData();
    },[dispatch]);

	useEffect(() => {
		if (errorFields || errorRoutes) {
			setErrorMessage(errorFields ? 'Error al cargar campos' : 'Error al cargar rutas');
			setHide(false);
			const timeoutId = setTimeout(() => {
				setHide(true);
			}, 5000);
	
			// Cleanup del timeout
			return () => clearTimeout(timeoutId);
		}
	}, [errorFields, errorRoutes]);

    const {week, field, route, onInputChange} = useForm({
        week: selRoutesBudget?.cCodigoSem || '',
        field: selRoutesBudget?.cCodigoCam || '',
        route: selRoutesBudget?.vDescripcionRut || ''
    });

    const onSubmit = async( event ) =>{
        event.preventDefault();

        if(week === '' || field === '' || route === '' ){
            setErrorMessage('Por favor, revisa los campos.');
			return;
        }else{
            const selectedRanch = fields.find(f => f.cCodigoCam.trim() === field.trim());
	        const selectedRoute = routes.find(r => r.vDescripcionRut.toLowerCase().trim() === route.toLowerCase().trim());

            const routeForMod = {
                cControlPru:selRoutesBudget.cControlPru,
                cCodigoSem: week,
				cCodigoCam: selectedRanch.cCodigoCam,
                vNombreCam: selectedRanch.vNombreCam,
				cControlRut: selectedRoute.cControlRut,
                vDescripcionRut: selectedRoute.vDescripcionRut,
				cCodigoUsu: selRoutesBudget.cCodigoUsu,
                cUsumodPru: user?.id,
                dModifiPru: dayjs(date).format("YYYY-MM-DDTHH:mm:ss")
            }

			setErrorMessage('');

			const success = await dispatch( startUpdateRouteBudget(routeForMod) );

			if(success){
				onClose()
			} else {
				setErrorMessage('Error al actualizar la ruta. Intente nuevamente.');
			}
        }
    }

  return (
        <div className="popup-container">
      <div className="rounded-4 popup">
        <h2>Modificar Ruta Presupuestada</h2>
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
        	<div hidden={hide} className="alert alert-danger" role="alert">
            	{errorMessage}
          	</div>
        )}
        
        <div className='container mb-1 mt-2'>
          <button className='btn btn-outline-success rounded-2 m-1'  onClick={ onSubmit }>Guardar</button>
          <button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
        </div>
        
      </div>
    </div>
  )
};
