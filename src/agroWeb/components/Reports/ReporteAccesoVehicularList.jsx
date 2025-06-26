import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicleAccessRecords } from '../../../store/slices/vehicleAccess/thunks';
import { Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import leaf_loader_slow from '../../../../assets/leaf_loader_slow.gif';

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
		if (isSearchTriggered) {
			dispatch(getVehicleAccessRecords(vehicleAccessFilters));
		}
	}, [isSearchTriggered, dispatch]);

	if (isLoadingVehicleAccessFilters) {
		return (
			<tr>
				<td colSpan="10" className="text-center">
					{/* <Spinner animation="border" /> Cargando datos... */}
					<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
						<img
							src={leaf_loader_slow}
							alt="Cargando..."
							style={{ width: '64px', height: '64px' }}
						/>
					</div>
					<h4>Cargando...</h4>
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
						<td className="text-center">{index + 1}</td>
						<td>{onlyDate(report.dIngresoInv)}</td>
						<td style={{paddingLeft: "10px"}}>{report.vNombrechofInv}</td>
						<td>{report.vAcompanianteInv}</td>
						<td>{report.vEmpresaInv}</td>
						<td>{report.cPlacaInv}</td>
						<td>{report.vMotivoInv}</td>
						<td>{report.vNombreCam}</td>
						<td>{onlyHour(report.dHringresoInv)}</td>
						<td>{onlyHour(report.dHrsalidaInv)}</td>
					</tr>
				))
			) : (
				<tr>
					<td colSpan="10" className="text-center">
						No hay datos disponibles.
					</td>
				</tr>
			)}
		</>
	)
}
