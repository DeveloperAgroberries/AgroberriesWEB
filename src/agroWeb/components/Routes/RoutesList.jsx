import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoutes, setActiveRoute } from '../../../store/slices/rutas';
import { getZones } from '../../../store/slices/zones';
import { ModRoute } from "../../components/Routes";
import { Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';

export const RouterList = ({ openRoutePopup, closeRoutePopup, searchTerm = '' })=> {
    const dispatch = useDispatch();
    const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
    const { zones = [], isLoading: isLoadingZones, errorMessage: errorZones } = useSelector((state) => state.zones);

    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getRoutes());
            await dispatch(getZones());
        };
        fetchData();
    }, [dispatch]);

    const handleActionClick = (route) => {
            setSelectedRow(route.cControlVeh);
            dispatch(setActiveRoute({ selVehicles: route }));
            
            // Abrimos el popup pasando la data directamente
            openRoutePopup(
                <ModRoute 
                    onClose={closeRoutePopup} 
                    vehicleData={route} 
                />
            );
        };

    if (isLoadingRoutes || isLoadingZones) {
        return (
            <tr>
                <td colSpan="9" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
    }

    if (errorRoutes || errorZones) {
        return (
            <tr>
                <td colSpan="9" className="text-center">
                    <Alert variant="danger">
                        {errorRoutes ? `Error al cargar rutas: ${errorRoutes}` : `Error al cargar zonas: ${errorZones}`}
                    </Alert>
                </td>
            </tr>
        );
    }

    const updatedData = routes.map(item => ({
        ...item,
        vNombreZon: zones.find(p => p.cCodigoZon === item.cCodigoZon)?.vNombreZon || item.cCodigoZon,
        cActivaRut: item.cActivaRut === '1' ? true : false
    }));

    const handleRowClick = (id, description, active, distance, cost, zone, user) => {
        setSelectedRow(id === selectedRow ? null : id);

        const route = {
            cControlRut: id,
            vDescripcionRut: description.trim(),
            cActivaRut: active,
            nDistanciaRut: distance,
            nCostoRut: cost,
            cCodigoZon: zone,
            cCodigoUsu: user.trim()
        }

        dispatch(setActiveRoute({ selRoutes: route }));
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

		const ruta = cleanField(record.vDescripcionRut);

		// 3. Ahora la comparación será exitosa porque ambos lados tienen UN solo espacio
		return (
			ruta.includes(text)
		);
	});

    return (
        <>
            {searchFiltered.length > 0 ? (
                searchFiltered.map((route, index) => (
                    <tr
                        className={selectedRow === route.cControlRut ? 'table-active' : ''}
                        key={route.cControlRut}
                        onClick={() => handleRowClick(
                            route.cControlRut,
                            route.vDescripcionRut,
                            route.cActivaRut,
                            route.nDistanciaRut,
                            route.nCostoRut,
                            route.cCodigoZon,
                            route.cCodigoUsu
                        )}
                    >
                        <th scope="row">{index + 1}</th>
                        <td>{route.vDescripcionRut}</td>
                        <td className="text-center" style={{ fontSize: '18px' }}>
                            {route.cActivaRut ? (
                                <Badge className="mb-10 mr-10 bg-success" pill>Activa</Badge>
                            ) : (
                                <Badge className="mb-10 mr-10 bg-danger" pill>Inactiva</Badge>
                            )}
                        </td>
                        <td>{route.nDistanciaRut}</td>
                        <td>${route.nCostoRut}</td>
                        <td>{route.vNombreZon}</td>
                        <td>{route.cCodigoUsu}</td>
                        <td>{route.cUsumodRut}</td>
                        <td className="text-center">
                            <OverlayTrigger placement="left" overlay={<Tooltip>Modificar</Tooltip>}>
                                <button className="btn btn-link p-0" onClick={() => handleActionClick(route)}>
                                    <i className="fas fa-edit fa-lg" style={{ color: '#2b65ff' }}></i>
                                </button>
                            </OverlayTrigger>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="8" className="text-center">
                        No hay datos disponibles.
                    </td>
                </tr>
            )}
        </>
    );
}
