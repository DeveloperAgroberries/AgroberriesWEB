import React, { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getRoutesBudget, setActiveRouteBudget } from '../../../store/slices/routesBudget';
import { Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';

export const RoutesBudgetList =  memo(() => {
	const dispatch = useDispatch();
    const { routesBudget = [], isLoading: isLoadingRoutesBudget, errorMessage: errorRoutesBudget } = useSelector( (state) => state.routesBudget );

    const [selectedRow, setSelectedRow] = useState(null);

    const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY HH:mm:ss")
	};

    useEffect(() =>{
        const fetchData = async () => {
            await dispatch( getRoutesBudget() );
        };
        fetchData();
    },[dispatch]);

    if(isLoadingRoutesBudget){
        return(
            <tr>
                <td colSpan="8" className="text-center">
                    <Spinner animation="border"/>Cargando Datos...
                </td>
            </tr>
        )
    }

    if(errorRoutesBudget){
        return(
            <tr>
                <td colSpan="8" className="text-center">
                    <Alert variant="danger">
                        {`Error al cargar rutas: ${errorRoutesBudget}`}
                    </Alert>
                </td>
            </tr>
        )
    }

    const handleRowClick = (id) => {
        setSelectedRow(id === selectedRow ? null : id);

        const routeBudget = routesBudget.find(route => route.cControlPru === id);

        if(routeBudget){
            const routeBudgetSelected = {
                cControlPru: routeBudget.cControlPru,
                cCodigoSem: routeBudget.cCodigoSem,
                cCodigoCam: routeBudget.cCodigoCam,
                vNombreCam: routeBudget.vNombreCam,
                cControlRut: routeBudget.cControlRut,
                vDescripcionRut: routeBudget.vDescripcionRut.trim(),
                cCodigoUsu: routeBudget.cCodigoUsu.trim()
            };

            dispatch(setActiveRouteBudget({selRoutesBudget: routeBudgetSelected}));
        }
      };

    return(
        <>
            {routesBudget.length > 0 ?(
                routesBudget.map( (routeBudget, index) =>(
                    <tr className={selectedRow === routeBudget.cControlPru ? 'table-active' : ''}
                        key={routeBudget.cControlPru}
                            onClick={() => handleRowClick(routeBudget.cControlPru)}
                    >
                            <th scope="row">{index + 1}</th>
                            <td>{routeBudget.cCodigoSem}</td>
                            <td>{routeBudget.vNombreCam}</td>
                            <td>{routeBudget.vDescripcionRut}</td>
                            <td>{routeBudget.cCodigoUsu}</td>
                            <td>{numberFormat(routeBudget.dCreacionPru)}</td>
                            <td>{routeBudget.cUsumodPru}</td>
                            <td>{routeBudget.dModifiPru ? numberFormat(routeBudget.dModifiPru): ""}</td>
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
    )
})
