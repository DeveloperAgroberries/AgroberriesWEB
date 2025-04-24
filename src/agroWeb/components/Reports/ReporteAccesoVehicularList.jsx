import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicleAccessRecords } from '../../../store/slices/vehicleAccess/thunks';
import { Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';

export const ReporteAccesoVehicularList = ({ isSearchTriggered }) => {
	const dispatch = useDispatch();
	const { reports = [] } = useSelector((state) => state.vehicleAccess)
	const { vehicleAccessFilters = [], isLoading: isLoadingVehicleAccessFilters, errorMessage: errorVehicleAccessFilters } = useSelector((state) => state.vehicleAccess)

	const onlyDate = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	};

	const onlyHour = (date) => {
		return date = dayjs(date).format("HH:mm:ss")
	}

	useEffect(() => {
		if(isSearchTriggered){
			dispatch(getVehicleAccessRecords(vehicleAccessFilters));
		}
	}, [isSearchTriggered, dispatch]);

	if (isLoadingVehicleAccessFilters) {
        return(
            <tr>
                <td colSpan="10" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
    }

	if (errorVehicleAccessFilters) {
        return (
            <tr>
                <td colSpan="10" className="text-center">
                    <Alert variant="danger">
                        {errorVehicleAccessFilters ? `Error al cargar datos: ${errorVehicleAccessFilters}` : `Error al cargar complementarios: ${errorVehicleAccessFilters}`}
                    </Alert>
                </td>
            </tr>
        );
    }

	return (
		<>
			{reports.length > 0 ? (
				reports.map((report, index) => (
					<tr key={index + 1}>
						<td scope="col">{index + 1}</td>
						<td scope="col">{onlyDate(report.dIngresoInv)}</td>
						<td scope="col">{report.vNombrechofInv}</td>
						<td scope="col">{report.vAcompanianteInv}</td>
						<td scope="col">{report.vEmpresaInv}</td>
						<td scope="col">{report.cPlacaInv}</td>
						<td scope="col">{report.vMotivoInv}</td>
						<td scope="col">{report.vNombreCam}</td>
						<td scope="col">{onlyHour(report.dHringresoInv)}</td>
						<td scope="col">{onlyHour(report.dHrsalidaInv)}</td>
					</tr>
				))
			):(
				<tr>
					<td colSpan="10" className="text-center">
						No hay datos disponibles.
					</td>
				</tr>
			)}
		</>
	)
}
