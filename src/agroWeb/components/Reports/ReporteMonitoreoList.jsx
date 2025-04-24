// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getFields } from "../../../store/slices/fields/thunks";
// import { getPests, getPhytosanitaryRecords, getTunnelTable, getLots } from "../../../store/slices/phytosanitary/thunks";
// import { getISOWeek, getMonth } from 'date-fns';
// import dayjs from 'dayjs';

// export const ReporteMonitoreoList = () => {
// 	const dispatch = useDispatch();
// 	const { phytosanitaryRecords = [] } = useSelector((state) => state.phytosanitary);
// 	const { tunnelTable = [] } = useSelector((state) => state.phytosanitary);
// 	const { pests = [] } = useSelector((state) => state.phytosanitary);
// 	const { lots = [] } = useSelector((state) => state.phytosanitary);
// 	const { fields = [] } = useSelector((state) => state.fields);
// 	const { phytoFilters = [] } = useSelector((state) => state.phytosanitary);

// 	const numberFormat = (date) => {
// 		return date = dayjs(date).format("DD/MM/YYYY")
// 	};

// 	const dateISOFormat = (date) => {
// 		return date = dayjs(date).format("YYYY-MM-DD")
// 	};

// 	const getWeekNumber = (date) => {
// 		return getISOWeek(date);
// 	};

// 	const getMonthNumber = (date) => {
// 		return getMonth(date);
// 	};

// 	const groupAndCountRecords = (records) => {
// 		const counters = {};
// 		const maxCount = 10;
// 		const groupedRecords = {};

// 		records.forEach(item => {
// 			//Key que encuentra los registros que tenga la misma fecha, Codigo de lote, codigo de tunel y codigo de plaga
// 			const key = `${item.dCapturaFit}-${item.cCodigoLot}-${item.cCodigoTab}-${item.cCodigoTun}-${item.cCodigoPla}`;
// 			if (!counters[key]) {
// 				counters[key] = 0;
// 				groupedRecords[key] = [];
// 			}

// 			counters[key] = (counters[key] % maxCount) + 1;
// 			item.Planta = counters[key];
// 			groupedRecords[key].push(item);
// 		});

// 		// Completar los grupos con registros con el secuencial adecuado si tienen menos de 5 registros
// 		Object.keys(groupedRecords).forEach(key => {
// 			let count = groupedRecords[key].length;
// 			while (count < 5) {
// 				const newRecord = {
// 					...groupedRecords[key][0],
// 					Planta: (count % maxCount) + 1, // secuencial correcto
// 					nPoblacionFit: 0
// 				};
// 				groupedRecords[key].push(newRecord);
// 				count++;
// 			}
// 		});

// 		// Combinar todos los registros agrupados en un solo array final
// 		const finalRecords = [];
// 		Object.keys(groupedRecords).forEach(key => {
// 			finalRecords.push(...groupedRecords[key]);
// 		});

// 		return finalRecords;
// 	}

// 	useEffect(() => {
// 		dispatch(getPhytosanitaryRecords());
// 		dispatch(getTunnelTable());
// 		dispatch(getPests());
// 		dispatch(getFields());
// 		dispatch(getLots());
// 	}, [phytoFilters])

// 	const updatedData1 = phytosanitaryRecords.filter((item) => {
// 		// Eliminar elementos donde dCapturaFit está vacío o es null
// 		return item.dCapturaFit.trim() !== null && item.dCapturaFit.trim() !== '';
// 	});

// 	const updatedData2 = updatedData1.filter((item) => {
// 		// Eliminar elementos donde nPoblacionFit está vacío o es null o es cero
// 		return item.nPoblacionFit !== null && item.nPoblacionFit !== '' && item.nPoblacionFit !== '0.00' && item.nPoblacionFit !== 0.00;
// 	});

// 	//Ordena los datos por fechas y hora
// 	const updatedData3 = updatedData2.sort((a, b) => new Date(a.dCapturaFit) - new Date(b.dCapturaFit));

// 	//Se agregan los datos de Sector, Tabla y Tunel por medio de terniarios
// 	const updatedData4 = updatedData3.map(item => ({
// 		...item,
// 		cCodigoLot: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoLot || item.cCodigoLot,
// 		cCodigoTab: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoTab || item.cCodigoTab,
// 		cCodigoTun: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoTun || item.cCodigoTun,
// 		cCodigoCam: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoCam || item.cCodigoCam
// 	}));

// 	//Filtra los datos por fechas
// 	let filtered;
// 	if (phytoFilters.dateStartRM !== '' && phytoFilters.dateEndRM !== '') {
// 		filtered = updatedData4.filter((item) => {
// 			return dateISOFormat(item.dCapturaFit) >= dateISOFormat(phytoFilters.dateStartRM) && dateISOFormat(item.dCapturaFit) <= dateISOFormat(phytoFilters.dateEndRM);
// 		});
// 	} else {
// 		filtered = updatedData4;
// 	}

// 	//Filtro del campo/rancho
// 	if (phytoFilters.ranch) {
// 		if (filtered === '' || filtered === undefined) {
// 			filtered = updatedData4.filter((item) => {
// 				if (item.cCodigoCam && item.cCodigoCam) {
// 					return item.cCodigoCam.includes(phytoFilters.ranch);
// 				}
// 			});
// 		} else {
// 			filtered = filtered.filter((item) => {
// 				if (phytoFilters.ranch === item.cCodigoCam) {
// 					return item.cCodigoCam.includes(phytoFilters.ranch);
// 				}
// 			});
// 		}
// 	}

// 	//Filtro de plagas/enfermedades
// 	if (phytoFilters.pest) {
// 		if (filtered === '' || filtered === undefined) {
// 			filtered = updatedData4.filter((item) => {
// 				if (item.cCodigoPla && item.cCodigoPla) {
// 					return item.cCodigoPla.includes(phytoFilters.pest);
// 				}
// 			});
// 		} else {
// 			filtered = filtered.filter((item) => {
// 				if (item.cCodigoPla && item.cCodigoPla) {
// 					return item.cCodigoPla.includes(phytoFilters.pest);
// 				}
// 			});
// 		}

// 		//Agrega el numero de planta a las capturas (seccion originalmente fuera del if del filtro)
// 		if (filtered === '' || filtered === undefined) {
// 			filtered = groupAndCountRecords(updatedData4);
// 		} else {
// 			filtered = groupAndCountRecords(filtered);
// 		}
// 	}else{
// 		//Aqui va la parte que hace el conteo de
// 	}

// 	//Se agregan las capturas por el tipo de plaga y relleno de 0's
// 	// const updatedData6 = filtered.map(item => ({
// 	// 	...item,
// 	// 	Trips: item.cCodigoPla.trim() === '00002' ? item.nPoblacionFit : "0",
// 	// 	Acaro: item.cCodigoPla.trim() === '00005' ? item.nPoblacionFit : "0",
// 	// 	Chicharrita: item.cCodigoPla.trim() === '00004' ? item.nPoblacionFit : "0",
// 	// 	MoscaBlanca: item.cCodigoPla.trim() === '00009' ? item.nPoblacionFit : "0",
// 	// 	ArañaRoja: item.cCodigoPla.trim() === '00001' ? item.nPoblacionFit : "0",
// 	// 	Gusano: item.cCodigoPla.trim() === '00008' ? item.nPoblacionFit : "0",
// 	// 	Drosophila: item.cCodigoPla.trim() === '00010' ? item.nPoblacionFit : "0",
// 	// 	Mayate: item.cCodigoPla.trim() === '00007' ? item.nPoblacionFit : "0",
// 	// 	Coleoptero: item.cCodigoPla.trim() === '00014' ? item.nPoblacionFit : "0",
// 	// 	Arrieras: item.cCodigoPla.trim() === '00015' ? item.nPoblacionFit : "0",
// 	// 	TramAdhesivas: item.cCodigoPla.trim() === '' ? item.nPoblacionFit : "0",
// 	// 	TramVinagre: item.cCodigoPla.trim() === '' ? item.nPoblacionFit : "0",
// 	// 	TramMelaza: item.cCodigoPla.trim() === '' ? item.nPoblacionFit : "0",
// 	// 	Roya: item.cCodigoPla.trim() === '00012' ? item.nPoblacionFit : "0",
// 	// 	Peronospora: item.cCodigoPla.trim() === '00016' ? item.nPoblacionFit : "0",
// 	// 	Botrytis: item.cCodigoPla.trim() === '00017' ? item.nPoblacionFit : "0",
// 	// 	Phytophtora: item.cCodigoPla.trim() === '00018' ? item.nPoblacionFit : "0",
// 	// 	Cenicilla: item.cCodigoPla.trim() === '00011' ? item.nPoblacionFit : "0",
// 	// 	Didymella: item.cCodigoPla.trim() === '00019' ? item.nPoblacionFit : "0",
// 	// 	Fumagina: item.cCodigoPla.trim() === '00020' ? item.nPoblacionFit : "0",
// 	// 	Antracnosis: item.cCodigoPla.trim() === '00013' ? item.nPoblacionFit : "0",
// 	// 	Alternaria: item.cCodigoPla.trim() === '00021' ? item.nPoblacionFit : "0",
// 	// 	Lasiodiplodia: item.cCodigoPla.trim() === '00022' ? item.nPoblacionFit : "0",
// 	// 	Fusarium: item.cCodigoPla.trim() === '00023' ? item.nPoblacionFit : "0"
// 	// }));

// 	//Cambia el codigo de sector por un numero
// 	const updatedData7 = filtered.map(item => ({
// 		...item,
// 		cCodigoLot: lots.find(p => p.cCodigoLot === item.cCodigoLot)?.cNumlocLot.trim() || item.cCodigoLot
// 	}));

// 	return (
// 		<>
// 			{
// 				updatedData7.map((report, index) => (
// 					<tr key={index + 1}>
// 						<td scope="col">{index + 1}</td>
// 						<td scope="col">{getWeekNumber(report.dCapturaFit)}</td>
// 						<td scope="col">{getMonthNumber(report.dCapturaFit) + 1}</td>
// 						<td scope="col">{numberFormat(report.dCapturaFit)}</td>
// 						<td scope="col">{report.cCodigoLot}</td>
// 						<td scope="col">{report.cCodigoTab}</td>
// 						<td scope="col">{report.cCodigoTun}</td>
// 						<td scope="col">{report.Planta}</td>
// 						<td scope="col">{report.Trips}</td>
// 						<td scope="col">{report.Acaro}</td>
// 						<td scope="col">{report.Chicharrita}</td>
// 						<td scope="col">{report.MoscaBlanca}</td>
// 						<td scope="col">{report.ArañaRoja}</td>
// 						<td scope="col">{report.Gusano}</td>
// 						<td scope="col">{report.Drosophila}</td>
// 						<td scope="col">{report.Mayate}</td>
// 						<td scope="col">{report.Coleoptero}</td>
// 						<td scope="col">{report.Arrieras}</td>
// 						<td scope="col">{report.TramAdhesivas}</td>
// 						<td scope="col">{report.TramVinagre}</td>
// 						<td scope="col">{report.TramMelaza}</td>
// 						<td scope="col">{report.Roya}</td>
// 						<td scope="col">{report.Peronospora}</td>
// 						<td scope="col">{report.Botrytis}</td>
// 						<td scope="col">{report.Phytophtora}</td>
// 						<td scope="col">{report.Cenicilla}</td>
// 						<td scope="col">{report.Didymella}</td>
// 						<td scope="col">{report.Fumagina}</td>
// 						<td scope="col">{report.Antracnosis}</td>
// 						<td scope="col">{report.Alternaria}</td>
// 						<td scope="col">{report.Lasiodiplodia}</td>
// 						<td scope="col">{report.Fusarium}</td>
// 					</tr>
// 				))
// 			}
// 		</>
// 	)
// }

//------------------------------------------------------------------------------------------------------------------------------------------------------

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFields } from "../../../store/slices/fields/thunks";
import { getPests, getPhytosanitaryRecords, getTunnelTable, getLots } from "../../../store/slices/phytosanitary/thunks";
import { getISOWeek, getMonth } from 'date-fns';
import dayjs from 'dayjs';

export const ReporteMonitoreoList = () => {
	const dispatch = useDispatch();
	const { phytosanitaryRecords = [] } = useSelector((state) => state.phytosanitary);
	const { tunnelTable = [] } = useSelector((state) => state.phytosanitary);
	const { pests = [] } = useSelector((state) => state.phytosanitary);
	const { lots = [] } = useSelector((state) => state.phytosanitary);
	const { fields = [] } = useSelector((state) => state.fields);
	const { phytoFilters = [] } = useSelector((state) => state.phytosanitary);

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	};

	const dateISOFormat = (date) => {
		return date = dayjs(date).format("YYYY-MM-DD")
	};

	const getWeekNumber = (date) => {
		return getISOWeek(date);
	};

	const getMonthNumber = (date) => {
		return getMonth(date);
	};

	// Agrupar y transformar los datos
	const groupedData = (filtered) => {
		const counters = {};
		const maxCount = 10;
		const groupedRecords = {};

		filtered.forEach(item => {
			const key = `${item.dCapturaFit}-${item.cCodigoLot}-${item.cCodigoTab}-${item.cCodigoTun}-${item.cCodigoPla}`;
			if (!counters[key]) {
				counters[key] = 0;
				groupedRecords[key] = [];
			}

			counters[key] = (counters[key] % maxCount) + 1;
			item.Planta = counters[key];
			groupedRecords[key].push(item);
		});

		// Completar los grupos con registros con el secuencial adecuado si tienen menos de 5 registros
		Object.keys(groupedRecords).forEach(key => {
			let count = groupedRecords[key].length;
			while (count < 5) {
				const newRecord = {
					...groupedRecords[key][0],
					Planta: (count % maxCount) + 1, // secuencial correcto
					nPoblacionFit: 0
				};
				groupedRecords[key].push(newRecord);
				count++;
			}
		});

		const finalRecords = [];
 		Object.keys(groupedRecords).forEach(key => {
			finalRecords.push(...groupedRecords[key]);
		});
	
		return finalRecords;
	}

	useEffect(() => {
		dispatch(getPhytosanitaryRecords());
		dispatch(getTunnelTable());
		dispatch(getPests());
		dispatch(getFields());
		dispatch(getLots());
	}, [phytoFilters])

	const deletedDataByEmptaDate = phytosanitaryRecords.filter((item) => {
		// Eliminar elementos donde dCapturaFit está vacío o es null
		return item.dCapturaFit.trim() !== null && item.dCapturaFit.trim() !== '';
	});

	const deletedDataByEmptyPoblacion = deletedDataByEmptaDate.filter((item) => {
		// Eliminar elementos donde nPoblacionFit está vacío o es null o es cero
		return item.nPoblacionFit !== null && item.nPoblacionFit !== '' && item.nPoblacionFit !== '0.00' && item.nPoblacionFit !== 0.00;
	});

	//Ordena los datos por fechas y hora
	const orderedDataByDateAndHour = deletedDataByEmptyPoblacion.sort((a, b) => new Date(a.dCapturaFit) - new Date(b.dCapturaFit));

	//Se agregan los datos de Sector, Tabla, Tunel y campo por medio de terniarios
	const dataAdition = orderedDataByDateAndHour.map(item => ({
		...item,
		cCodigoLot: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoLot || item.cCodigoLot,
		cCodigoTab: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoTab || item.cCodigoTab,
		cCodigoTun: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoTun || item.cCodigoTun,
		cCodigoCam: tunnelTable.find(p => p.cCodigoTtu === item.cCodigoTtu)?.cCodigoCam || item.cCodigoCam
	}));

	//Filtra los datos por fechas
	let filteredData;
	if (phytoFilters.dateStartRM !== '' && phytoFilters.dateEndRM !== '') {
		filteredData = dataAdition.filter((item) => {
			return dateISOFormat(item.dCapturaFit) >= dateISOFormat(phytoFilters.dateStartRM) && dateISOFormat(item.dCapturaFit) <= dateISOFormat(phytoFilters.dateEndRM);
		});
	} else {
		filteredData = dataAdition;
	}

	//Filtro del campo/rancho
	if (phytoFilters.ranch) {
		if (filteredData === '' || filteredData === undefined) {
			filteredData = dataAdition.filter((item) => {
				if (item.cCodigoCam && item.cCodigoCam) {
					return item.cCodigoCam.includes(phytoFilters.ranch);
				}
			});
		} else {
			filteredData = filteredData.filter((item) => {
				if (phytoFilters.ranch === item.cCodigoCam) {
					return item.cCodigoCam.includes(phytoFilters.ranch);
				}
			});
		}
	}

	//Filtro de plagas/enfermedades
	if (phytoFilters.pest) {
		if (filteredData === '' || filteredData === undefined) {
			filteredData = dataAdition.filter((item) => {
				if (item.cCodigoPla && item.cCodigoPla) {
					return item.cCodigoPla.includes(phytoFilters.pest);
				}
			});
		} else {
			filteredData = filteredData.filter((item) => {
				if (item.cCodigoPla && item.cCodigoPla) {
					return item.cCodigoPla.includes(phytoFilters.pest);
				}
			});
		}
	}

	const groupedArray = groupedData(filteredData);

	//Agregamos los datos para que cada una de las plagas tenga un apartado en el objeto
	const groupedData2 = groupedArray.reduce((acc, current) => {
		const key = `${current.dCapturaFit}_${current.cCodigoLot}_${current.cCodigoTab}_${current.cCodigoTun}_${current.Planta}`;
		if (!acc[key]) {
		  acc[key] = {
			dCapturaFit: current.dCapturaFit,
			cCodigoLot: current.cCodigoLot,
			cCodigoTab: current.cCodigoTab,
			cCodigoTun: current.cCodigoTun,
			Planta: current.Planta,
			// Aquí inicializamos el objeto con nPoblacionFit por cada cCodigoPla
			poblaciones: {
			  [current.cCodigoPla]: current.nPoblacionFit,
			},
		  };
		} else {
		  // Si ya existe la clave, añadimos el nPoblacionFit correspondiente
		  acc[key].poblaciones[current.cCodigoPla] = current.nPoblacionFit;
		}
		return acc;
	  }, {});
	
	  // Convertimos los datos agrupados en un array para ser mapeados en la tabla
	  const groupedArray2 = Object.values(groupedData2);

	// Cambia el codigo de sector por un numero
	const finalData = groupedArray2.map(item => ({
		...item,
		cCodigoLot: lots.find(p => p.cCodigoLot === item.cCodigoLot)?.cNumlocLot.trim() || item.cCodigoLot
	}));

	//Se mapean los datos de todas las plagas
	const plagasMap = {
		Trips: "00002",
		Acaro: "00005",
		Chicharrita: "00004",
		MoscaBlanca: "00009",
		ArañaRoja: "00001",
		Gusano: "00008",
		Drosophila: "000010",
		Mayate: "00007",
		Coleoptero: "000014",
		Arrieras: "000015",
		TramAdhesivas: "",
		TramVinagre: "",
		TramMelaza: "",
		Roya: "000012",
		Peronospora: "000016",
		Botrytis: "000017",
		Phytophtora: "000018",
		Cenicilla: "000011",
		Didymella: "000019",
		Fumagina: "000020",
		Antracnosis: "000013",
		Alternaria: "000021",
		Lasiodiplodia: "000022",
		Fusarium: "000023"
	};

	return (
		<>
			{
				finalData.map((report, index) => (
					<tr key={index + 1}>
						<td scope="col">{getWeekNumber(report.dCapturaFit)}</td>
						<td scope="col">{getMonthNumber(report.dCapturaFit) + 1}</td>
						<td scope="col">{numberFormat(report.dCapturaFit)}</td>
						<td scope="col">{report.cCodigoLot}</td>
						<td scope="col">{report.cCodigoTab}</td>
						<td scope="col">{report.cCodigoTun}</td>
						<td scope="col">{report.Planta}</td>
						{/* Mapeado de las plagas dentro de las capturas */}
						{Object.keys(plagasMap).map((plaga, i) => (
							<td scope="col" key={i}>{report.poblaciones[plagasMap[plaga]] || 0 }</td>
						))}
					</tr>
				))
			}
		</>
	)
}

