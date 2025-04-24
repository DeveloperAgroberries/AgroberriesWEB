import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getVehicles } from "../../../store/slices/vehicles";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { Alert, Badge, Spinner } from "react-bootstrap";

export const VehiculosPorProveedorList = () => {
	const dispatch = useDispatch();

  	const {vehicles = [], isLoading: isLoadingVehicles, errorMessage: errorVehicles} = useSelector( (state) => state.vehicles );
  	const {providers = [], isLoading: isLoadingProviders, errorMessage: errorProviders} = useSelector( (state) => state.providers );
  	const {filters = []} = useSelector((state) => state.reports );

  	useEffect(() => {
        dispatch( getProviders() );
  		dispatch( getVehicles() );
  	}, [filters])

	  const loading = [isLoadingVehicles, isLoadingProviders].filter(Boolean);
	  if (loading.length > 0) {
		  return(
			  <tr>
				  <td colSpan="6" className="text-center">
					  <Spinner animation="border" /> Cargando datos...
				  </td>
			  </tr>
		  );
	  }
  
	  const errors = [errorVehicles, errorProviders].filter(Boolean);
	  if (errors.length > 0) {
		  return (
			  <tr>
				  <td colSpan="6" className="text-center">
					  <Alert variant="danger">
						  {errors.map((error, index) => (
							  <div key={index}>Error al cargar datos: {error}</div>
						  ))}
					  </Alert>
				  </td>
			  </tr>
		  );
	  }

  	const updatedData = vehicles.map((item) => ({
  		...item,
  		cControlPrv: providers.find(p => p.cControlPrv === item.cControlPrv)?.vNombrePrv || item.cControlPrv
  	}));

	let filtered;
	if(filters.provider){
    	if(filtered === '' || filtered === undefined){
			filtered = updatedData.filter((item) => {
				if(item.cControlPrv && item.cControlPrv.toLowerCase()){
					return item.cControlPrv.toLowerCase().trim().includes(filters.provider.toLowerCase().trim());
				}
	  		});
		}else{
			filtered = filtered.filter((item) => {
				if(item.cControlVeh && item.cControlVeh.toLowerCase()){
					return item.cControlPrv.toLowerCase().trim().includes(filters.provider.toLowerCase().trim());
				}
		  	});
		}
	}

	if( filters.provider === ''){
  		filtered = updatedData;
	}

  return (
    <>
		{filtered.length > 0 ?(
			filtered.map( (report,index) => (
        		<tr key={index + 1}>
        	    	<th scope="row">{index + 1}</th>
        	    	<td>{report.cControlPrv}</td>
        	    	<td>{report.cPlacaVeh}</td>
					<td className="text-center">
						{report.cActivoVeh ? (
							<Badge className="mb-10 mr-10 bg-success" pill>Activo</Badge>
						):(
							<Badge className="mb-10 mr-10 bg-danger" pill>Inactivo</Badge>
						)}
					</td>
        	    	<td>{report.cCapacidadVeh}</td>
        	    	<td>{report.vTipoVeh}</td>
        	  	</tr>
    		))
		):(
			<tr>
                <td colSpan="6" className="text-center">
                    No hay datos disponibles.
                </td>
            </tr>
		)} 
    </>
  )
}
