import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoutes } from '../../store/slices/rutas';

export const RouteListForSelect = () => {
	const dispatch = useDispatch();
  	const {routes =[]} = useSelector( (state) => state.routes );
    
  	useEffect(() =>{
    	dispatch( getRoutes() );
  	},[])

	const activeRputes =routes.filter(route => route.cActivaRut === "1");
	const sortedRoutes = [...activeRputes].sort((a, b) => a.vDescripcionRut.localeCompare(b.vDescripcionRut));

  	return (
    	<>
      		{
        		sortedRoutes.map( route =>(
          			<option value={route.cControlRut} key={route.cControlRut}>{route.vDescripcionRut}</option>
        		))
      		}
    	</>
  	)
}
