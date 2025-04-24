import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataTransportRecordsByDateForAT } from "../../../store/slices/reports/thunks";
import { getVehicles } from "../../../store/slices/vehicles";
import { getRoutes } from "../../../store/slices/rutas";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { resetReports, setActiveRecord, setTransportAnalysisFilters } from "../../../store/slices/reports/transportAnalysisSlice";
import { Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../../../auth/context/AuthContext";
import dayjs from 'dayjs';

export const AnalisisTransportesList = ({ isSearchTriggered }) => {
	const dispatch = useDispatch();
	const {user} = useContext(AuthContext);
	const { reports = [], isLoading: isLoadingReports, errorMessage: errorReports } = useSelector((state) => state.transportAnalysis);
	const { vehicles = [], isLoading: isLoadingvehicles, errorMessage: errorVehicles } = useSelector((state) => state.vehicles);
	const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
	const { providers = [], isLoading: isLoadingProviders, errorMessage: errorProviders } = useSelector((state) => state.providers);
	const { transportAnalysisFilters = [] } = useSelector((state) => state.transportAnalysis);
	const [selectedRow, setSelectedRow] = useState(null);
	const date = new Date();

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	}

	const dateISOFormat = (date) => {
		return date = dayjs(date).format("YYYY-MM-DD")
	}

	//Antes de la ruta especial de 450 por viaje 
	const groupAndCountRecords = (records) => {
		const grouped = {};
		records.forEach(item => {
			const date = dateISOFormat(item.dRegistroTrn); // extrae solo la fecha
			const key = `${date}-${item.cControlRut}-${item.cControlPrv}`; // clave combinada por fecha, ruta y proveedor
	
			if (!grouped[key]) {
				grouped[key] = {
					...item,
					nCostoSumadoRuta: 0,
					nCantidadTransportada: 0, // inicializamos el conteo
					totalRecords: 0,          // total de registros agrupados
				};
			}
	
			// Incrementa el conteo de registros para este grupo
			grouped[key].nCostoSumadoRuta += item.nCostoRut;
			grouped[key].nCantidadTransportada += item.cTiporegTrn; // O bien asignar a 1 por registro
			grouped[key].totalRecords += 1; // Contador de cuántos registros están en este grupo
		});
		
		// Calcular el promedio de transporte por grupo
		const groupsWithAverage = Object.values(grouped).map(group => {
			let costoRuta = group.nCostoSumadoRuta / group.totalRecords;
			let promedioUsoTransporte = group.nCantidadTransportada / group.totalRecords;

			let promedioAgregado = promedioUsoTransporte;

			let hasComplement = records.some(item => item.cCodigoTra.trim() === "00000" && item.cControlRut === group.cControlRut);
			if(hasComplement) {
				promedioAgregado += 0.10;
			}

			const analista = hasComplement ? promedioAgregado.toFixed(2) : '';

			let pagoDeTransporte;
			if (analista) {
				pagoDeTransporte = costoRuta * 1;
			} else {
				if (promedioUsoTransporte === 1) {
					pagoDeTransporte = costoRuta * 0.5;
				} else if (promedioUsoTransporte.toFixed(1) >= 1.1) {
					pagoDeTransporte = costoRuta * 1;
				} else {
					pagoDeTransporte = 0;
				}
			}

			return {
				...group,
				costoRuta,
				promedioUsoTransporte,
				pagoDeTransporte,
				analista,
			};
		});
	
		return groupsWithAverage;
	}

	//Falta refactorizar codigo para que registre los complementos
	// const groupAndCountRecords = (records) => {
	// 	const grouped = {};
	
	// 	records.forEach(item => {
	// 		// Comprobamos si es la ruta 61 y el proveedor 3
	// 		if (item.cControlRut === 61 && item.cControlPrv === 3) {
	// 			const date = new Date(item.dRegistroTrn);
	
	// 			// Encuentra el grupo por ruta, proveedor y fecha
	// 			const key = `${item.cControlRut}-${item.cControlPrv}`;
	
	// 			if (!grouped[key]) grouped[key] = []; // Inicializamos el array de grupos de tiempo
	
	// 			let addedToGroup = false;
	
	// 			// Busca si el registro cae en un grupo existente de menos de 2 horas
	// 			grouped[key].forEach((subgroup) => {
	// 				const lastDateInGroup = new Date(subgroup[subgroup.length - 1].dRegistroTrn);
	// 				const timeDiff = (date - lastDateInGroup) / (1000 * 60 * 60); // Diferencia en horas
	
	// 				if (timeDiff <= 2) {
	// 					subgroup.push(item);
	// 					addedToGroup = true;
	// 				}
	// 			});
	
	// 			// Si no hay un grupo con menos de 2 horas de diferencia, crea uno nuevo
	// 			if (!addedToGroup) {
	// 				grouped[key].push([item]);
	// 			}
	// 		} else {
	// 			// Agrupación estándar para otras rutas y proveedores
	// 			const date = dateISOFormat(item.dRegistroTrn);
	// 			const key = `${date}-${item.cControlRut}-${item.cControlPrv}`;
	
	// 			if (!grouped[key]) {
	// 				grouped[key] = {
	// 					...item,
	// 					nCostoSumadoRuta: 0,
	// 					nCantidadTransportada: 0,
	// 					totalRecords: 0,
	// 				};
	// 			}
	
	// 			grouped[key].nCostoSumadoRuta += item.nCostoRut;
	// 			grouped[key].nCantidadTransportada += item.cTiporegTrn;
	// 			grouped[key].totalRecords += 1;
	// 		}
	// 	});
	
	// 	// Calcular el promedio de transporte por grupo y aplicar costos individuales para ruta 61 y proveedor 3
	// 	const groupsWithAverage = Object.values(grouped).flatMap(group => {
	// 		if (Array.isArray(group)) {
	// 			// Caso especial de ruta 61 y proveedor 3
	// 			return group.map(subgroup => {

	// 				const costoRuta = (subgroup.reduce((sum, item) => sum + item.nCostoRut, 0)) / subgroup.length;
	// 				const promedioUsoTransporte = subgroup.reduce((sum, item) => sum + item.cTiporegTrn, 0) / subgroup.length;
					
	// 				return {
	// 					...subgroup[0],
	// 					costoRuta,
	// 					promedioUsoTransporte,
	// 					pagoDeTransporte: costoRuta,
	// 					analista: '',
	// 				};
	// 			});
	// 		} else {
	// 			// Otras rutas y proveedores
	// 			const costoRuta = group.nCostoSumadoRuta / group.totalRecords;
	// 			const promedioUsoTransporte = group.nCantidadTransportada / group.totalRecords;
	
	// 			let pagoDeTransporte;
	// 			if (promedioUsoTransporte === 1) {
	// 				pagoDeTransporte = costoRuta * 0.5;
	// 			} else if (promedioUsoTransporte >= 1.1) {
	// 				pagoDeTransporte = costoRuta * 1;
	// 			} else {
	// 				pagoDeTransporte = 0;
	// 			}
	
	// 			return {
	// 				...group,
	// 				costoRuta,
	// 				promedioUsoTransporte,
	// 				pagoDeTransporte,
	// 				analista: '',
	// 			};
	// 		}
	// 	});
	
	// 	return groupsWithAverage;
	// };

	useEffect(() => {
		if(isSearchTriggered){
			dispatch(getDataTransportRecordsByDateForAT(transportAnalysisFilters));
			dispatch(getVehicles());
			dispatch(getRoutes());
			dispatch(getProviders());
		}

		return () => {
			dispatch(resetReports());
			dispatch(setActiveRecord([]));
			dispatch(setTransportAnalysisFilters([]));
		};
	}, [isSearchTriggered, dispatch]);

	const loading = [isLoadingReports, isLoadingvehicles, isLoadingRoutes, isLoadingProviders].filter(Boolean);
	if (loading.length > 0) {
		return(
			<tr>
				<td colSpan="9" className="text-center">
					<Spinner animation="border" /> Cargando datos...
				</td>
			</tr>
		);
	}

	const errors = [errorReports, errorVehicles, errorRoutes, errorProviders].filter(Boolean);
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

	const deleteEmptyCodeWorkers = reports.filter((item) => {
		// Eliminar elementos donde cCodigoTra está vacío o es null
		return item.cCodigoTra.trim() !== null && item.cCodigoTra.trim() !== '';
	});

	//Ordena los datos por fechas y hora
	//Se usa la fecha del registro en dispositivo
	const orderDates = deleteEmptyCodeWorkers.sort((a, b) => new Date(a.dRegistroTrn) - new Date(b.dRegistroTrn));

	//Elimina los registros duplicados por medio de la fecha exacta
	const set = new Set();
	const deleteDuplicateDates = orderDates.filter((item) => {
		const compositeKey = `${item.dRegistroTrn}-${item.cCodigoTra}`
		const isDuplicate = set.has(compositeKey);
		set.add(item.dRegistroTrn);
		return !isDuplicate;
	});

	const addProviderCodeAndVehicleCode = deleteDuplicateDates.map(item => ({
		...item,
		cPlacaVeh: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cPlacaVeh || item.cPlacaVeh,
		cControlPrv: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cControlPrv || item.cControlPrv
	}));

	const addProviderName = addProviderCodeAndVehicleCode.map(item => ({
		...item,
		vNombrePrv: providers.find(p => p.cControlPrv === item.cControlPrv)?.vNombrePrv || item.vNombrePrv,
	}));

	const addRoutesData = addProviderName.map(item => ({
		...item,
		vNombreRut: routes.find(p => p.cControlRut === item.cControlRut)?.vDescripcionRut || item.vDescripcionRut,
		// cControlRut: routes[(item.cControlRut - 1)] ? routes[(item.cControlRut - 1)].vDescripcionRut : item.vDescripcionRut,
		nDistanciaRut: routes.find(p => p.cControlRut === item.cControlRut)?.nDistanciaRut || item.nDistanciaRut,
		nCostoRut: routes.find(p => p.cControlRut === item.cControlRut)?.nCostoRut || item.nCostoRut,
		cCodigoZon: routes.find(p => p.cControlRut === item.cControlRut)?.cCodigoZon || item.cCodigoZon,
	}));

	const updateTiporegTrn = addRoutesData.map(item => ({
		...item,
		cTiporegTrn: item.cTiporegTrn === "0" ? 1 : item.cTiporegTrn === "1" ? 2 : "-" // Cambia 0 a 1, y 1 a 2
	}));

	const groupedDataWithAverage = groupAndCountRecords(updateTiporegTrn);

	const handleRowClick = (id, dateReport, vehicle, route, cost) => {
		const newSelectedRow = id === selectedRow ? null : id;
    	setSelectedRow(newSelectedRow);

		if (newSelectedRow === null) {
			const register = [{
				cCodigoTrn:'',
				cCodigoappTrn:'',
				vChoferTrn:'',
				cCodigoTra:'',
				cFormaregTrn:'',
				dRegistroTrn:'',
				cTiporegTrn:'',
				cLongitudTrn:'',
				cLatitudTrn:'',
				cAlturaTrn:'',
				cCodigoUsu:'',
				dCreacionTrn:'',
				cControlVeh:'',
				cControlRut:'',
				nCostoRut:'',
			}]
			dispatch(setActiveRecord({ activeRecord: register }));
			return;
		}
  
		const register = [{
			cCodigoTrn:0,
            cCodigoappTrn:1,
            vChoferTrn:"Complemento Ruta",
            cCodigoTra:"00000",
            cFormaregTrn:"1",
            dRegistroTrn:dayjs(dateReport).format("YYYY-MM-DD")+ "T" +dayjs(date).format("HH:mm:ss"),
            cTiporegTrn:"0",
            cLongitudTrn:"-103.609149",
            cLatitudTrn:"19.905528",
            cAlturaTrn:"1345.199951",
            cCodigoUsu:user?.id || null,
            dCreacionTrn:dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
            cControlVeh:vehicle,
            cControlRut:route,
            nCostoRut:cost,
		}]

		dispatch( setActiveRecord({activeRecord: register}));
	};

	return (
		<>
			{groupedDataWithAverage.length > 0 ? (
				groupedDataWithAverage.map((report) =>(
					<tr className={selectedRow === report.cCodigoTrn ? 'table-active' : ''}
						key={report.cCodigoTrn}
						onClick={() => handleRowClick(
							report.cCodigoTrn,
							report.dRegistroTrn,
							report.cControlVeh,
							report.cControlRut,
							report.costoRuta
						)}>
						<td>{report.vNombrePrv}</td>
						<td>{report.vNombreRut}</td>
						<td>{numberFormat(report.dRegistroTrn)}</td>
						<td>{"$"+report.costoRuta}</td>
						<td>{report.promedioUsoTransporte.toFixed(2)}</td>
						<td>{report.analista}</td>
						<td>{"$"+report.pagoDeTransporte}</td>
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
