import { useDispatch, useSelector } from "react-redux";
import { getDataTransportRecordsByDateForRT } from "../../../store/slices/reports/thunks";
import { useEffect } from "react";
import { getVehicles } from "../../../store/slices/vehicles";
import { getRoutes } from "../../../store/slices/rutas";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { resetReports } from "../../../store/slices/reports/registrosTransporteSlice";
import { Spinner, Alert } from "react-bootstrap";
import dayjs from 'dayjs';

export const RegistrosTransportesList = ({ isSearchTriggered }) => {
	const dispatch = useDispatch();

	const { reports = [], isLoading: isLoadingReports, errorMessage: errorReports } = useSelector((state) => state.registrosTransporte);
	const { vehicles = [], isLoading: isLoadingVehicles, errorMessage: errorVehicles } = useSelector((state) => state.vehicles);
	const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
	const { providers = [], isLoading: isLoadingPRoviders, errorMessage: errorProviders } = useSelector((state) => state.providers);
	const { registrosTransporteFilters = [] } = useSelector((state) => state.registrosTransporte);

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY HH:mm:ss")
	}

	const dateISOFormat = (date) => {
		return date = dayjs(date).format("YYYY-MM-DD")
	}

	useEffect(() => {
		if(isSearchTriggered){
			dispatch(getDataTransportRecordsByDateForRT(registrosTransporteFilters));
			dispatch(getVehicles());
			dispatch(getRoutes());
			dispatch(getProviders());
		}

		return () => {
			dispatch(resetReports());
		};
	}, [dispatch, isSearchTriggered, registrosTransporteFilters])

	if (isLoadingReports || isLoadingVehicles || isLoadingRoutes || isLoadingPRoviders) {
        return(
            <tr>
                <td colSpan="9" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
    }

	if (errorReports || errorVehicles || errorRoutes || errorProviders) {
        return (
            <tr>
                <td colSpan="9" className="text-center">
                    <Alert variant="danger">
                        {errorReports ? `Error al cargar datos: ${errorReports}` : `Error al cargar complementarios: ${errorVehicles}`}
                    </Alert>
                </td>
            </tr>
        );
    }

	//Linea comentadas debido a BUG que daba espacios en blanco, las lineas superiores a las comentadas dan el dato correcto
	const updatedData = reports.map(item => ({
		...item,
		cPlacaVeh: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cPlacaVeh || item.cPlacaVeh,
		// cControlVeh: vehicles[(item.cControlVeh - 1)] ? vehicles[(item.cControlVeh - 1)].cPlacaVeh : item.cPlacaVeh,
		cControlPrv: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cControlPrv || item.cControlPrv,
		// cControlPrv: vehicles[(item.cControlVeh - 1)] ? vehicles[(item.cControlVeh - 1)].cControlPrv : item.cControlPrv,
		cTiporegTrn: item.cTiporegTrn === '0' ? 'Subida' : 'Bajada',
		nCostoRut: item.nCostoRut == null ? '0' : item.nCostoRut
	}));

	const updatedData2 = updatedData.map(item => ({
		...item,
		vNombrePrv: providers.find(p => p.cControlPrv === item.cControlPrv)?.vNombrePrv || item.vNombrePrv,
		// cControlPrv: providers[(item.cControlPrv - 1)] ? providers[(item.cControlPrv - 1)].vNombrePrv : item.vNombrePrv,
	}));

	const updatedData3 = updatedData2.map(item => ({
		...item,
		vDescripcionRut: routes.find(p => p.cControlRut === item.cControlRut)?.vDescripcionRut || item.vDescripcionRut,
		// cControlRut: routes[(item.cControlRut - 1)] ? routes[(item.cControlRut - 1)].vDescripcionRut : item.vDescripcionRut,
	}));

	const updatedData4 = updatedData3.filter((item) => {
		// Eliminar elementos donde cCodigoTra está vacío o es null
		return item.cCodigoTra.trim() !== null && item.cCodigoTra.trim() !== '';
	});

	const updatedData5 = updatedData4.sort((a, b) => new Date(a.dRegistroTrn) - new Date(b.dRegistroTrn));

	const set = new Set();
	const updatedDataFinal = updatedData5.filter((item) => {
		const compositeKey = `${item.dRegistroTrn}-${item.cCodigoTra}`
		const isDuplicate = set.has(compositeKey);
		set.add(item.dRegistroTrn);
		return !isDuplicate;
	});

	let filtered = [];
	if (registrosTransporteFilters.startDate != '' && registrosTransporteFilters.endDate != '') {
		filtered = updatedDataFinal.filter((item) => {
			return dateISOFormat(item.dRegistroTrn) >= dateISOFormat(registrosTransporteFilters.startDate) && dateISOFormat(item.dRegistroTrn) <= dateISOFormat(registrosTransporteFilters.endDate);
		});
	}

	if (registrosTransporteFilters.provider) {
		const dataToFilter = filtered === 0 ? updatedDataFinal : filtered;
		filtered = dataToFilter.filter((item) => {
			return item.vNombrePrv && item.vNombrePrv.toLowerCase().trim().includes(registrosTransporteFilters.provider.toLowerCase().trim());
		});
	}

	if (registrosTransporteFilters.vehicle) {
		const dataToFilter = filtered === 0 ? updatedDataFinal : filtered;
		filtered = dataToFilter.filter((item) => {
			return item.cPlacaVeh && item.cPlacaVeh.toLowerCase().trim().includes(registrosTransporteFilters.vehicle.toLowerCase().trim());
		});
	}

	if (registrosTransporteFilters.route) {
		const dataToFilter = filtered === 0 ? updatedDataFinal : filtered;
		filtered = dataToFilter.filter((item) => {
			return item.cControlRut && item.cControlRut.toString().includes(registrosTransporteFilters.route);
		});
	}

	if (registrosTransporteFilters.date1 === '' && registrosTransporteFilters.date2 === '' && registrosTransporteFilters.provider === '' && registrosTransporteFilters.vehicle === '' && registrosTransporteFilters.route === '') {
		filtered = updatedDataFinal;
	}

	return (
		<>
			{filtered.length > 0 ?(
				filtered.map((report, index) => (
					<tr key={index + 1}>
						<th scope="row">{index + 1}</th>
						<td>{report.vChoferTrn}</td>
						<td>{report.cCodigoTra}</td>
						<td>{report.cTiporegTrn}</td>
						<td>{report.vNombrePrv}</td>
						<td>{report.cPlacaVeh}</td>
						<td>{report.vDescripcionRut}</td>
						<td>{numberFormat(report.dRegistroTrn)}</td>
						<td>{"$"+report.nCostoRut.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
					</tr>
				))
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
