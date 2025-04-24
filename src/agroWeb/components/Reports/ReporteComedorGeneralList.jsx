import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDiningRoomRecords, getFieldByWorker } from "../../../store/slices/diningRoom/thunks";
import { Alert, Spinner } from "react-bootstrap";
import { getISOWeek } from "date-fns";
import dayjs from "dayjs";

export const ReporteComedorGeneralList = ({ isSearchTriggered }) => {
	const dispatch = useDispatch();
	const { diningRoomRecords = [], isLoading: isLoadingDiningRoomRecords , errorMessage: errorDiningRoomRecords } = useSelector((state) => state.diningRoom);
	const { fieldByWorkerRecords = [], isLoading: isLoadingFieldByWorkerRecords , errorMessage: errorFieldByWorkerRecords } = useSelector((state) => state.diningRoom);
	const { diningRoomFilters = [] } = useSelector((state) => state.diningRoom);

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	};

	const getWeekNumber = (date) => {
		return getISOWeek(date);
	};

	useEffect(() => {
		if(isSearchTriggered){
			dispatch(getDiningRoomRecords(diningRoomFilters));
			dispatch(getFieldByWorker());
		}
	}, [isSearchTriggered, dispatch]);

	if (isLoadingDiningRoomRecords || isLoadingFieldByWorkerRecords) {
        return(
            <tr>
                <td colSpan="10" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
    }

	if (errorDiningRoomRecords || errorFieldByWorkerRecords) {
        return (
            <tr>
                <td colSpan="10" className="text-center">
                    <Alert variant="danger">
                        {errorDiningRoomRecords ? `Error al cargar datos: ${errorFieldByWorkerRecords}` : `Error al cargar complementarios: ${errorDiningRoomRecords}`}
                    </Alert>
                </td>
            </tr>
        );
    }

	const deletedDataByEmptyDate = diningRoomRecords.filter((item) => {
		// Eliminar elementos donde dRegistroAlim está vacío o es null
		return item.dRegistroAlim.trim() !== null && item.dRegistroAlim.trim() !== '';
	});

	const deletedDataByEmptyPoblacion = deletedDataByEmptyDate.filter((item) => {
		// Eliminar elementos donde cCodigoTra está vacío o es null
		return item.cCodigoTra.trim() !== null && item.cCodigoTra.trim() !== '';
	});

	//Se agrega vNombreCam, cCodigoCam, VTipotraTra y CActivoTra por medio de terniarios
	const fieldAddedToData = deletedDataByEmptyPoblacion.map(item => {
		if(item.cCodigoAlim === "3" ){
			return item
		}

		return{
			...item,
			vNombreCam: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vNombreCam || item.vNombreCam,
			cCodigoCam: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.cCodigoCam || item.cCodigoCam,
			vTipoTra: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vTipoTra || item.vTipoTra,
			vEstadoTra: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vEstadoTra || item.vEstadoTra,
			vNombreTra: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vNombreTra || item.vNombreTra,
			vApellidopatTra: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vApellidopatTra || item.vApellidopatTra,
			vApellidomatTra: fieldByWorkerRecords.find(c => c.cCodigoTra.trim() === item.cCodigoTra.trim())?.vApellidomatTra || item.vApellidomatTra,
		}
	});

	const orderedDataByDateAndHour = fieldAddedToData.sort((a, b) => new Date(a.dRegistroAlim) - new Date(b.dRegistroAlim));

	let filteredData;
	if (diningRoomFilters.ranch) {
		if (orderedDataByDateAndHour === '' || orderedDataByDateAndHour === undefined) {
			filteredData = deletedDataByEmptyPoblacion.filter((item) => {
				if (item.cCodigoCam && item.cCodigoCam) {
					return item.cCodigoCam.includes(diningRoomFilters.ranch);
				}
			});
		} else {
			filteredData = orderedDataByDateAndHour.filter((item) => {
				if (diningRoomFilters.ranch === item.cCodigoCam) {
					return item.cCodigoCam.includes(diningRoomFilters.ranch);
				}
			});
		}
	}else{
		filteredData = orderedDataByDateAndHour;
	}

	if (diningRoomFilters.user) {
		if (filteredData === '' || filteredData === undefined) {
			filteredData = orderedDataByDateAndHour.filter((item) => {
				if (item.cCodigoUsu && item.cCodigoUsu) {
					return item.cCodigoUsu.includes(diningRoomFilters.user);
				}
			});
		} else {
			filteredData = filteredData.filter((item) => {
				if (item.cCodigoUsu && item.cCodigoUsu) {
					return item.cCodigoUsu.includes(diningRoomFilters.user);
				}
			});
		}
	}

	return (
		<>
			{filteredData.length > 0 ? (
				filteredData.map((report, index) => (
					<tr key={index + 1}>
						<td scope="col">{index + 1}</td>
						<td scope="col">{report.cCodigoTra}</td>
						<td scope="col">{report.vApellidopatTra + " " + report.vApellidomatTra + " " + report.vNombreTra}</td>
						<td scope="col">{report.vTipoTra}</td>
						<td scope="col">{report.vEstadoTra}</td>
						<td scope="col">{report.vTipoalimentoAlim}</td>
						<td scope="col">{report.vNombreCam}</td>
						<td scope="col">{getWeekNumber(report.dRegistroAlim)}</td>
						<td scope="col">{numberFormat(report.dRegistroAlim)}</td>
						<td scope="col">{report.cCodigoUsu}</td>
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
