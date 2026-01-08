import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { getVehicles, setActiveVehicle } from "../../../store/slices/vehicles";
import { ModVehicle } from "../../components/Vehicles";
import { Badge, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";

export const VehiclesList = ({ openVehiclePopup, closeVehiclePopup, searchTerm = '' }) => {
    const dispatch = useDispatch();
    const { vehicles = [], isLoading: isLoadingVehicles } = useSelector((state) => state.vehicles);
    const { isLoading: isLoadingProviders } = useSelector((state) => state.providers);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        dispatch(getVehicles());
        dispatch(getProviders());
    }, [dispatch]);

    if (isLoadingVehicles || isLoadingProviders) {
        return (
            <tr>
                <td colSpan="8" className="text-center">
                    <Spinner animation="border" size="sm" /> Cargando datos...
                </td>
            </tr>
        );
    }

    const updatedData = vehicles.map(item => ({
        ...item,
        cActivoVeh: item.cActivoVeh === '1'
    }));

    const handleActionClick = (vehicle) => {
        setSelectedRow(vehicle.cControlVeh);
        dispatch(setActiveVehicle({ selVehicles: vehicle }));
        
        // Abrimos el popup pasando la data directamente
        openVehiclePopup(
            <ModVehicle 
                onClose={closeVehiclePopup} 
                vehicleData={vehicle} 
            />
        );
    };

	// 🚀 6. FILTRO DINÁMICO (INPUT DE BÚSQUEDA)
	// Este se aplica al final de todos los filtros anteriores
	const searchFiltered = updatedData.filter(record => {
		// 1. Limpiamos el texto que escribe el usuario:
		// .trim() quita espacios al inicio/final
		// .replace(/\s+/g, ' ') convierte múltiples espacios en uno solo
		const text = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
		if (!text) return true;

		// 2. Función interna para limpiar los datos de la tabla antes de comparar
		const cleanField = (field) =>
			String(field || '').toLowerCase().replace(/\s+/g, ' ').trim();

		const placa = cleanField(record.cPlacaVeh);

		// 3. Ahora la comparación será exitosa porque ambos lados tienen UN solo espacio
		return (
			placa.includes(text)
		);
	});

    return (
        <>
            {searchFiltered.length > 0 ? (
                searchFiltered.map((vehicle, index) => (
                    <tr 
                        className={selectedRow === vehicle.cControlVeh ? 'table-active' : ''}
                        key={vehicle.cControlVeh}
                    >
                        <th scope="row">{index + 1}</th>
                        <td>{vehicle.cPlacaVeh}</td>
                        <td className="text-center" style={{ fontSize: '18px' }}>
                            <Badge className={vehicle.cActivoVeh ? "bg-success" : "bg-danger"} pill>
                                {vehicle.cActivoVeh ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </td>
                        <td>{vehicle.cCapacidadVeh}</td>
                        <td>{vehicle.vTipoVeh}</td>
                        <td>{vehicle.cCodigoUsu}</td>
                        <td>{vehicle.cUsumodVeh}</td>
                        <td className="text-center">
                            <OverlayTrigger placement="left" overlay={<Tooltip>Modificar</Tooltip>}>
                                <button className="btn btn-link p-0" onClick={() => handleActionClick(vehicle)}>
                                    <i className="fas fa-edit fa-lg" style={{ color: '#2b65ff' }}></i>
                                </button>
                            </OverlayTrigger>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="8" className="text-center">No hay datos disponibles.</td>
                </tr>
            )}
        </>
    );
};