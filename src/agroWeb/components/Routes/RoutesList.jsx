import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoutes, setActiveRoute } from '../../../store/slices/rutas';
import { getZones } from '../../../store/slices/zones';
import { Badge, Spinner } from 'react-bootstrap';

export const RouterList = () => {
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
    },[dispatch]);
    
    if (isLoadingRoutes || isLoadingZones) {
        return(
            <tr>
                <td colSpan="8" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
    }

    if (errorRoutes || errorZones) {
        return (
            <tr>
                <td colSpan="8" className="text-center">
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

    const handleRowClick = (id,description,active,distance,cost,zone,user) => {
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

        dispatch( setActiveRoute({selRoutes: route}));
    };

    return (
        <>
            {updatedData.length > 0 ? (
                updatedData.map((route, index) => (
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
                        <td className="text-center">
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
