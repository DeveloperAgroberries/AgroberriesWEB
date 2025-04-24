import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { getVehicles, setActiveVehicle } from "../../../store/slices/vehicles";
import { Alert, Badge, Spinner } from "react-bootstrap";

export const VehiclesList = () => {
	const dispatch = useDispatch();
    const {vehicles = [], isLoading: isLoadingVehicles, errorMessage: errorVehicles} = useSelector( (state) => state.vehicles );
    const {providers = [], isLoading: isLoadingProviders, errorMessage: errorProviders} = useSelector( (state) => state.providers );
	const [selectedRow, setSelectedRow] = useState(null);
    
    useEffect(() => {
		const fetchData = async () => {
			await dispatch( getVehicles() )
			await dispatch( getProviders() );
		}
      fetchData();
    }, [dispatch]);

	if(isLoadingVehicles || isLoadingProviders){
		return(
            <tr>
                <td colSpan="8" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
	}

	if(errorVehicles || errorProviders){
		return(
			<tr>
				<td colSpan="8" className="text-center">
					<Alert variant="danger">
						{`Error al cargar los vehiculos: ${errorVehicles}`}
					</Alert>
				</td>
			</tr>
		);
	}

	const updatedData = vehicles.map(item => ({
		...item,
		cActivoVeh: item.cActivoVeh === '1' ? true : false
	}))

    const handleRowClick = (id,plate,active,capacity,vehicleType,provider,user) => {
      setSelectedRow(id === selectedRow ? null : id);

    	const vehicle = {
        	cControlVeh: id,
        	cPlacaVeh: plate.trim(),
			cActivoVeh: active,
        	cCapacidadVeh: capacity,
        	vTipoVeh: vehicleType,
        	cControlPrv: parseInt(provider),
        	cCodigoUsu: user.trim()
    	}

      dispatch( setActiveVehicle({selVehicles: vehicle}));
    };

    return (
    	<>
			{updatedData.length > 0 ? (
				updatedData.map( (vehicle,index) =>(
				<tr className={selectedRow === vehicle.cControlVeh ? 'table-active' : ''}
					key={vehicle.cControlVeh}
					onClick={() => handleRowClick(
						vehicle.cControlVeh,
						vehicle.cPlacaVeh,
						vehicle.cActivoVeh,
						vehicle.cCapacidadVeh,
						vehicle.vTipoVeh,
						parseInt(vehicle.cControlPrv),
						vehicle.cCodigoUsu
					)}>
					<th scope="row">{index + 1}</th>
					<td>{vehicle.cPlacaVeh}</td>
					<td className="text-center">
						{vehicle.cActivoVeh ? (
							<Badge className="mb-10 mr-10 bg-success" pill>Activo</Badge>
						):(
							<Badge className="mb-10 mr-10 bg-danger" pill>Inactivo</Badge>
						)}
					</td>
					<td>{vehicle.cCapacidadVeh}</td>
					<td>{vehicle.vTipoVeh}</td>
					<td>{vehicle.cCodigoUsu}</td>
					<td>{vehicle.cUsumodVeh}</td>
				</tr>
			))
			) : (
				<tr>
					<td colSpan="6" className="text-center">
						No hay datos disponibles.
					</td>
				</tr>
			)}        
    	</>
	);
}
