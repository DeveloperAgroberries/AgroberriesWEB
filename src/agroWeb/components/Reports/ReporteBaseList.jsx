import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataTransportRecordsByDateForBT } from "../../../store/slices/reports/thunks";
import { getVehicles } from "../../../store/slices/vehicles";
import { getRoutes } from "../../../store/slices/rutas";
import { getProviders } from "../../../store/slices/vehicleProviders";
import { getFields } from "../../../store/slices/fields/thunks";
import { getUsers } from "../../../store/slices/users/thunks";
import { getZones } from "../../../store/slices/zones";
import { getNomWeeks } from "../../../store/slices/nomWeeks/thunks";
import { resetReports } from "../../../store/slices/reports/reporteBaseSlice";
import { getISOWeek } from 'date-fns';
import { Alert, Spinner } from "react-bootstrap";
import dayjs from 'dayjs';

export const ReporteBaseList = ({ isSearchTriggered, searchTerm = '', setTotalRecords }) => {
	const dispatch = useDispatch();
	const { reports = [], isLoading: isLoadingReports, errorMessage: errorReports } = useSelector((state) => state.transportBaseReport);
	const { vehicles = [], isLoading: isLoadingVehicles, errorMessage: errorVehicles } = useSelector((state) => state.vehicles);
	const { routes = [], isLoading: isLoadingRoutes, errorMessage: errorRoutes } = useSelector((state) => state.routes);
	const { providers = [], isLoading: isLoadingProviders, errorMessage: errorProviders } = useSelector((state) => state.providers);
	const { fields = [], isLoading: isLoadingFields, errorMessage: errorFields } = useSelector((state) => state.fields);
	const { users = [], isLoading: isLoadingUsers, errorMessage: errorUsers } = useSelector((state) => state.users);
	const { zones = [], isLoading: isLoadingZones, errorMessage: errorZones } = useSelector((state) => state.zones);
	const { nomWeeks = [], isLoading: isLoadingNomWeeks, errorMessage: errorNomWeeks } = useSelector((state) => state.nomWeeks);
	const { transportBaseFilters = [] } = useSelector((state) => state.transportBaseReport);

	const onlyTime = (date) => {
		return date = dayjs(date).format("HH:mm:ss")
	}

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	}

	const dateISOFormat = (date) => {
		return date = dayjs(date).format("YYYY-MM-DD")
	}

	const getWeekNumber2 = (date) => {
		return getISOWeek(date);
	}

	const extractDate = (datetime) => {
		return datetime.split('T')[0]; // Suponiendo que el formato es 'YYYY-MM-DDTHH:MM:SS'
	};

	const groupAndCountRecords = (records) => {
		const grouped = {};
		records.forEach(item => {
			const date = extractDate(item.dRegistroTrn);
			const key = `${date}-${item.cControlVeh}-${item.cControlRut}`;
			if (!grouped[key]) {
				grouped[key] = {
					...item,
					nCantidadTransportada: 0,
				};
			}
			grouped[key].nCantidadTransportada += 1;
		});

		return Object.values(grouped);
	}

	useEffect(() => {
		if (isSearchTriggered) {
			dispatch(getDataTransportRecordsByDateForBT(transportBaseFilters));
			dispatch(getVehicles());
			dispatch(getRoutes());
			dispatch(getProviders());
			dispatch(getFields());
			dispatch(getUsers());
			dispatch(getZones());
			dispatch(getNomWeeks());
		}

		return () => {
			dispatch(resetReports());
		};
	}, [isSearchTriggered, dispatch])

	const loadingStates = [
		isLoadingReports,
		isLoadingVehicles,
		isLoadingRoutes,
		isLoadingProviders,
		isLoadingFields,
		isLoadingUsers,
		isLoadingZones,
		isLoadingNomWeeks,
	];

	const errors = [
		errorVehicles,
		errorRoutes,
		errorProviders,
		errorReports,
		errorFields,
		errorUsers,
		errorZones,
		errorNomWeeks
	].filter(Boolean);

	const updatedData = reports.filter((item) => {
		// Eliminar elementos donde cCodigoTra está vacío o es null
		return item.cCodigoTra.trim() !== null && item.cCodigoTra.trim() !== '';
	});

	//Ordena los datos por fechas y hora
	const updatedData2 = updatedData.sort((a, b) => new Date(a.dRegistroTrn) - new Date(b.dRegistroTrn));

	//Elimina los registros duplicados por medio de la fecha exacta y codigo de trabajador
	const set = new Set();
	const updatedData3 = updatedData2.filter((item) => {
		const compositeKey = `${item.dRegistroTrn}-${item.cCodigoTra}`
		const isDuplicate = set.has(compositeKey);
		set.add(item.dRegistroTrn);
		return !isDuplicate;
	});

	let filtered;
	if (transportBaseFilters.startDate != '' && transportBaseFilters.endDate != '') {
		filtered = updatedData3.filter((item) => {
			return dateISOFormat(item.dRegistroTrn) >= dateISOFormat(transportBaseFilters.startDate) && dateISOFormat(item.dRegistroTrn) <= dateISOFormat(transportBaseFilters.endDate);
		});
	}

	if (transportBaseFilters.schedule) {
		if (filtered === '' || filtered === undefined) {
			filtered = updatedData3.filter((item) => {
				if (transportBaseFilters.schedule === "12:00:00") {
					return onlyTime(item.dRegistroTrn.toLowerCase().trim()) < transportBaseFilters.schedule.toLowerCase().trim();
				} else {
					return onlyTime(item.dRegistroTrn.toLowerCase().trim()) > transportBaseFilters.schedule.toLowerCase().trim();
				}
			});
		} else {
			filtered = filtered.filter((item) => {
				if (transportBaseFilters.schedule === "12:00:00") {
					return onlyTime(item.dRegistroTrn.toLowerCase().trim()) < transportBaseFilters.schedule.toLowerCase().trim();
				} else {
					return onlyTime(item.dRegistroTrn.toLowerCase().trim()) > transportBaseFilters.schedule.toLowerCase().trim();
				}
			});
		}
	}

	const updatedDataGroup = groupAndCountRecords(filtered);

	// FUNCION PARA OBTENER PRECIO REAL DE RUTAS EN SINALOA
	const updatedEspecial = updatedDataGroup.map(item => {
		const rutasEspeciales = [245, 244, 240, 239, 227];
		const esRutaEspecial = rutasEspeciales.includes(Number(item.cControlRut));

		if (esRutaEspecial) {
			// 1. Obtenemos el costo base
			const costoBase = Number(item.nCostoRut);

			// 2. IMPORTANTE: Usamos la cantidad transportada del ITEM ACTUAL 
			// Si quieres que se multiplique SOLO por los 11 de esa fila:
			const cantidadActual = Number(item.nCantidadTransportada || 0);
			// console.log("Base: " + costoBase + " Actual: " + cantidadActual)
			return {
				...item,
				precioPorPersona: costoBase,
				nCostoPersona: costoBase,
				// 3. LA OPERACIÓN: 90 * 11 = 990
				nCostoRut: (costoBase * cantidadActual)
			};
		}

		return {
			...item,
			precioPorPersona: "N/A"
		};
	});

	//Linea comentadas debido a BUG que daba espacios en blanco, las lineas superiores a las comentadas dan el dato correcto
	const updatedData4 = updatedEspecial.map(item => ({
		...item,
		cControlVeh: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cPlacaVeh || item.cPlacaVeh,
		// cControlVeh: vehicles[(item.cControlVeh - 1)] ? vehicles[(item.cControlVeh - 1)].cPlacaVeh : item.cPlacaVeh,
		cControlPrv: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cControlPrv || item.cControlPrv,
		// cControlPrv: vehicles[(item.cControlVeh - 1)] ? vehicles[(item.cControlVeh - 1)].cControlPrv : item.cControlPrv,
		cCapacidadVeh: vehicles.find(p => p.cControlVeh === item.cControlVeh)?.cCapacidadVeh || item.cCapacidadVeh,
		cTiporegTrn: item.cTiporegTrn === '0' ? 'Subida' : 'Bajada',
		cCodigoSem: nomWeeks.find(p => (dateISOFormat(item.dRegistroTrn) >= dateISOFormat(p.dIniSem) && dateISOFormat(item.dRegistroTrn) <= dateISOFormat(p.dFinSem)))?.cCodigoSem || "-",
	}));

	const updatedData5 = updatedData4.map(item => ({
		...item,
		cControlPrv: providers.find(p => p.cControlPrv === item.cControlPrv)?.vNombrePrv || item.vNombrePrv,
		// cControlPrv: providers[(item.cControlPrv - 1)] ? providers[(item.cControlPrv - 1)].vNombrePrv : item.vNombrePrv,
	}));

	const updatedData6 = updatedData5.map(item => ({
		...item,
		cControlRut: routes.find(p => p.cControlRut === item.cControlRut)?.vDescripcionRut || item.vDescripcionRut,
		// cControlRut: routes[(item.cControlRut - 1)] ? routes[(item.cControlRut - 1)].vDescripcionRut : item.vDescripcionRut,
		nDistanciaRut: routes.find(p => p.cControlRut === item.cControlRut)?.nDistanciaRut || item.nDistanciaRut,
		// nCostoRut: routes.find(p => p.cControlRut === item.cControlRut)?.nCostoRut || item.nCostoRut,
		cCodigoZon: routes.find(p => p.cControlRut === item.cControlRut)?.cCodigoZon || item.cCodigoZon,
	}));

	const updatedData7 = updatedData6.map(item => ({
		...item,
		vNombreZon: zones.find(p => p.cCodigoZon === item.cCodigoZon)?.vNombreZon || item.vNombreZon,
	}));

	const updatedData8 = updatedData7.map(item => ({
		...item,
		cCodigoCam: users.find(p => p.cCodigoUsu === item.cCodigoUsu)?.cCodigoCam || "-",
	}));

	const updatedData9 = updatedData8.map(item => ({
		...item,
		vNombreCam: fields.find(p => p.cCodigoCam.trim() === item.cCodigoCam.trim())?.vNombreCam || '-',
	}));

	const updatedData10 = updatedData9.map(item => ({
		...item,
		nOcupacion: Math.round(((item.nCantidadTransportada * 100) / item.cCapacidadVeh) * 100) / 100,
		nCostoKm: Math.round((item.nCostoRut / item.nDistanciaRut) * 100) / 100,
	}));

	const updatedDataFinal = updatedData10.map(item => ({
		...item,
		nCostoPersona: Math.round((item.nCostoRut / item.nCantidadTransportada) * 100) / 100,
	}));

	// 🚀 6. FILTRO DINÁMICO
	const searchFiltered = updatedDataFinal.filter(record => {
		const text = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
		if (!text) return true;

		const cleanField = (field) => String(field || '').toLowerCase().replace(/\s+/g, ' ').trim();

		// IMPORTANTE: Verificar que los nombres de las propiedades coincidan con el objeto final
		return (
			cleanField(record.cControlVeh).includes(text) ||
			cleanField(record.cControlRut).includes(text) || // Antes tenías vNombrePrv, pero arriba lo mapeaste a cControlPrv
			cleanField(record.cControlPrv).includes(text) || // Arriba lo mapeaste a placa
			cleanField(record.vNombreZon).includes(text)    // Arriba lo mapeaste a descripción
		);
	});

	// ✅ CORRECCIÓN DEL EFFECT
	useEffect(() => {
		if (setTotalRecords) {
			// En lugar de pasar searchFiltered como dependencia, 
			// el efecto reacciona cuando los reportes base o el texto cambian.
			setTotalRecords(searchFiltered.length);
		}
		// Agregamos searchFiltered.length para que se dispare solo cuando el número cambie
	}, [searchTerm, reports, searchFiltered.length, setTotalRecords]);

	// 3. LOS RENDERS CONDICIONALES AL FINAL
	if (loadingStates.some(Boolean)) {
		return <tr><td colSpan="17" className="text-center"><Spinner /> Cargando...</td></tr>;
	}

	if (errors.length > 0) {
		return <tr><td colSpan="17" className="text-center"><Alert>Error...</Alert></td></tr>;
	}

	// console.log("especial: "+JSON.stringify(updatedEspecial, null, 2));
	console.table(searchFiltered)
	return (
		<>
			{searchFiltered.length > 0 ? (
				searchFiltered.map((report, index) => (
					<tr key={index + 1}>
						{/* <th scope="row">{index + 1}</th> */}
						<td>{numberFormat(report.dRegistroTrn)}</td>
						<td>{report.cCodigoSem}</td>
						<td>{report.cControlVeh}</td>
						<td>{report.cControlRut}</td>
						<td>{report.vNombreCam}</td>
						<td>{report.nDistanciaRut}</td>
						<td>
							{report.precioPorPersona === "N/A"
								? "N/A"
								: "$" + report.precioPorPersona
							}
						</td>
						<td>{"$" + report.nCostoRut}</td>
						<td>{report.cCapacidadVeh}</td>
						<td>{report.nCantidadTransportada}</td>
						<td>{report.nOcupacion + "%"}</td>
						<td>{"$" + report.nCostoKm}</td>
						<td>{report.cControlPrv}</td>
						<td>{getWeekNumber2(report.dRegistroTrn)}</td>
						<td>{"$" + report.nCostoPersona}</td>
						<td>{report.vNombreZon}</td>
					</tr>
				))
			) : (
				<tr>
					<td colSpan="17" className="text-center">
						No hay datos disponibles.
					</td>
				</tr>
			)}
		</>
	)
}
