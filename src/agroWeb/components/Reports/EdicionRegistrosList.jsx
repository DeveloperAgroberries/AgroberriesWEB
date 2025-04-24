import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataTransportRecordsByDateAndRoute } from "../../../store/slices/reports/thunks";
import { resetReports } from "../../../store/slices/reports/editingTransportRecordsSlice";
import { getVehicles } from "../../../store/slices/vehicles";
import { getRoutes } from "../../../store/slices/rutas";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { Alert, Spinner } from "react-bootstrap";
import dayjs from "dayjs";

export const EdicionRegistrosList = ({ isSearchTriggered, setSelectedRows, selectAll, setUniqueReports }) => {
	const dispatch = useDispatch();

	const [selectedRows, setInternalSelectedRows] = useState([]);
	
	const { transportRecordsFilters = [] } = useSelector((state) => state.editingTransportRecords);
	const { reports = [], isLoading: isLoadingReports, errorMessage: errorReports } = useSelector((state) => state.editingTransportRecords)
	const { vehicles = [], isLoading: isLoadingVehicles, errorMessage: errorVehicles } = useSelector((state) => state.vehicles);
	const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
	const { providers = [], isLoading: isLoadingProviders, errorMessage: errorProviders } = useSelector((state) => state.providers);

	const formatDate = (date, format) => dayjs(date).format(format);

	useEffect(() => {
		if(isSearchTriggered){
			dispatch(getDataTransportRecordsByDateAndRoute(transportRecordsFilters));
			dispatch(getVehicles());
			dispatch(getRoutes());
			dispatch(getProviders());
		}

		return () => {
			setInternalSelectedRows([]);
			setSelectedRows([]);
			dispatch(resetReports());
		};
	}, [isSearchTriggered, dispatch, transportRecordsFilters]);

	useEffect(() => {
		if(selectAll) {
			const allIds = reports.map(report => report.cCodigoTrn);
			setSelectedRows(allIds);
			setInternalSelectedRows(allIds);
		} else {
			setSelectedRows([]);
			setInternalSelectedRows([]);
		}
	}, [selectAll, setSelectedRows, reports]);

	const handleCheckboxChange = (report) => {
		let updatedSelectedRows = [...selectedRows];
		const reportId = report.cCodigoTrn;

        if (updatedSelectedRows.includes(reportId)) {
			// Si ya está seleccionado, lo deseleccionamos
			updatedSelectedRows = updatedSelectedRows.filter(item => item !== reportId);
		} else {
			// Si no está seleccionado, lo agregamos
			updatedSelectedRows.push(reportId);
		}
	
		setSelectedRows(updatedSelectedRows);
		setInternalSelectedRows(updatedSelectedRows);
	};

	const loading = [isLoadingReports, isLoadingVehicles, isLoadingRoutes, isLoadingProviders].some(Boolean);
	if (loading.length > 0) {
		return(
            <tr>
                <td colSpan="9" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
	}

	const errors = [errorVehicles, errorRoutes, errorProviders, errorReports].filter(Boolean);
	if (errors.length > 0) {
		return (
			<tr>
				<td colSpan="9" className="text-center">
					<Alert variant="danger">
						{errors.map((error, index) => (
							<div key={index}>Error al cargar datos: {error}</div>
						))}
					</Alert>
				</td>
			</tr>
		);
	}

	const enrichedReports = reports.map(item => ({
		...item,
		cPlacaVeh: vehicles.find(v => v.cControlVeh === item.cControlVeh)?.cPlacaVeh || item.cPlacaVeh,
		cControlPrv: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cControlPrv || item.cControlPrv,
		vDescripcionRut: routes.find(r => r.cControlRut === item.cControlRut)?.vDescripcionRut || item.vDescripcionRut,
		cTiporegTrn: item.cTiporegTrn === '0' ? 'Subida' : 'Bajada',
	})).filter(item => item.cCodigoTra?.trim());

	const addNameProvider = enrichedReports.map(item => ({
		...item,
		vNombrePrv: providers.find(p => p.cControlPrv === item.cControlPrv)?.vNombrePrv || item.vNombrePrv,
	}));

	const uniqueReports = Array.from(new Map(addNameProvider.map(item => [`${item.dRegistroTrn}_${item.cCodigoTra}`, item])).values()).sort((a, b) => new Date(a.dRegistroTrn) - new Date(b.dRegistroTrn));

	useEffect(() => {
        setUniqueReports(uniqueReports);
    }, [reports, vehicles, routes, providers]);

	return (
		<>
			{uniqueReports.length > 0 ?(
					<>
					{uniqueReports.map((report) => (
						<tr key={report.cCodigoTrn}>
							<td className="text-center">
								<input
									className="form-check-input"
									type="checkbox"
									checked={selectedRows.includes(report.cCodigoTrn)}
									onChange={() => handleCheckboxChange(report)}
								/>
							</td>
							<td>{report.vChoferTrn}</td>
							<td>{report.cCodigoTra}</td>
							<td>{report.cTiporegTrn}</td>
							<td>{report.vNombrePrv}</td>
							<td>{report.cPlacaVeh}</td>
							<td>{report.vDescripcionRut}</td>
							<td>{formatDate(report.dRegistroTrn, "DD/MM/YYYY HH:mm:ss")}</td>
							<td>{"$" + report.nCostoRut.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
						</tr>
					))}
					</>
			):(
				<tr>
                    <td colSpan="9" className="text-center">
                        No hay datos disponibles.
                    </td>
                </tr>
			)}
		</>
	)
}
