import { useDispatch, useSelector } from "react-redux";
import { getDiningRoomRecords } from "../../../store/slices/diningRoom/thunks";
import { useEffect } from "react";
import { getISOWeek } from "date-fns";
import { Alert, Spinner } from "react-bootstrap";
import dayjs from "dayjs";

export const ReporteUsoAppComedorList = () => {
	const dispatch = useDispatch();
	const { diningRoomRecords = [], isLoading: isLoadingDiningRoomRecords, errorMessage: errorDiningRoomRecords } = useSelector((state) => state.diningRoom);
	const { diningRoomFilters = [] } = useSelector((state) => state.diningRoom);

	const numberFormat = (date) => {
		return date = dayjs(date).format("DD/MM/YYYY")
	};

	const getWeekNumber = (date) => {
		return getISOWeek(date);
	};

	useEffect(() => {
		dispatch(getDiningRoomRecords(diningRoomFilters));
	}, [diningRoomFilters])

	if (isLoadingDiningRoomRecords) {
		return(
            <tr>
                <td colSpan="4" className="text-center">
                    <Spinner animation="border" /> Cargando datos...
                </td>
            </tr>
        );
	}

	if (errorDiningRoomRecords) {
		return (
			<tr>
				<td colSpan="4" className="text-center">
					<Alert variant="danger">
						{errorDiningRoomRecords ? `Error al cargar datos: ${errorDiningRoomRecords}` : `Error al cargar complementarios: ${errorDiningRoomRecords}`}
					</Alert>
				</td>
			</tr>
		);
	}

	const deletedDataByEmptyDate = diningRoomRecords.filter((item) => {
		// Eliminar elementos donde dRegistroAlim está vacío o es null
		return item.dRegistroAlim.trim() !== null && item.dRegistroAlim.trim() !== '';
	});

	//Ordena los datos por fechas y hora
	const orderedDataByDateAndHour = deletedDataByEmptyDate.sort((a, b) => new Date(a.dRegistroAlim) - new Date(b.dRegistroAlim));

	const reformatDate = orderedDataByDateAndHour.map(item =>{
		const dateObject = new Date(item.dRegistroAlim);
		const dateString = dateObject.toISOString().split('T')[0];
		return{...item, dRegistroAlim: dateString}
	});

	const groupedData = reformatDate.reduce((acc, current) => {
		const key = `${current.cCodigoUsu}-${current.dRegistroAlim}`;
		if(!acc[key]){
			acc[key]={
				dRegistroAlim: current.dRegistroAlim,
				cCodigoUsu: current.cCodigoUsu,
			}
		}else{
			acc[key].cCodigoUsu = current.cCodigoUsu;
		}

		return acc;
	},{});

	const finalData = Object.values(groupedData);

	return (
		<>
			{finalData.length > 0 ? (
				finalData.map((report, index) => (
					<tr key={index + 1}>
						<td scope="col">{index+1}</td>
						<td scope="col">{getWeekNumber(report.dRegistroAlim)}</td>
						<td scope="col">{numberFormat(report.dRegistroAlim)}</td>
						<td scope="col">{report.cCodigoUsu}</td>
					</tr>
				))
			):(
				<tr>
                    <td colSpan="4" className="text-center">
                        No hay datos disponibles.
                    </td>
                </tr>
			)}
		</>
	)
}
