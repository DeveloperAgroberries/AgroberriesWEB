import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActivos, getSubFamilias, getCamposActivos } from "../../../store/slices/combustibles";
import { Alert, Badge, Spinner } from "react-bootstrap";

// export const ActivosList = ({ openAddActivo }) => { // Recibimos la función como prop
// 	const dispatch = useDispatch();
// 	const { combustibles = [], isLoading, errorMessage } = useSelector((state) => state.combustibles);
// 	const [selectedRow, setSelectedRow] = useState(null);

// 	useEffect(() => {
// 		const fetchData = async () => {
// 			await dispatch(getActivos());
// 			dispatch(getSubFamilias());
// 		};
// 		fetchData();
// 	}, []);

// 	if (isLoading) return (<tr><td colSpan="7" className="text-center"><Spinner animation="border" /> Cargando datos...</td></tr>);
// 	if (errorMessage) return (<tr><td colSpan="7" className="text-center"><Alert variant="danger">{`Error al cargar los activos: ${errorMessage}`}</Alert></td></tr>);

// 	const updatedData = combustibles.map(item => ({ ...item, cActivoAfi: item.cActivoAfi === '1' ? true : false }));
// 	const handleRowClick = (id) => setSelectedRow(id === selectedRow ? null : id);

// 	return (
// 		<>
// 			{updatedData.length > 0 ? (
// 				updatedData.map((activo, index) => (
// 					<tr
// 						className={selectedRow === activo.cCodigoAfi ? 'table-active' : ''}
// 						key={activo.cCodigoAfi}
// 						onClick={() => handleRowClick(activo.cCodigoAfi)}
// 					>
// 						<th scope="row">{activo.cCodigoAfi}</th>
// 						<td>{activo.vNombreAfi}</td>
// 						<td className="text-center">
// 							<Badge className={`mb-10 mr-10 bg-${activo.cActivoAfi ? 'success' : 'danger'}`} pill>{activo.cActivoAfi ? 'Activo' : 'Inactivo'}</Badge>
// 						</td>
// 						<td>{activo.vMarcaAfi}</td>
// 						<td>{activo.vModeloAfi}</td>
// 						<td>{activo.vNumserieAfi}</td>
// 						<td>{activo.cCodigorelAfi}</td>
// 					</tr>
// 				))
// 			) : (
// 				<tr><td colSpan="7" className="text-center">No hay datos disponibles.</td></tr>
// 			)}
// 		</>
// 	);
// };	
export const ActivosList = () => { // Ya no recibe openAddActivo como prop si solo devuelve datos
	const dispatch = useDispatch();
	const { combustibles = [], isLoading, errorMessage } = useSelector((state) => state.combustibles);
	const campos = useSelector(state => state.combustibles.activosCampos);

	useEffect(() => {
		const fetchData = async () => {
			await dispatch(getActivos());
			dispatch(getSubFamilias());
		};
		fetchData();
	}, [dispatch]); // Añade dispatch como dependencia para evitar warnings


	// Función auxiliar para formatear la fecha a YYYY-MM-DD
	const formatDateString = (dateString) => {
		if (!dateString) return '';

		// Crea un objeto de fecha
		const date = new Date(dateString);

		// Obtiene los componentes de la fecha
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		// Regresa la fecha en formato YYYY-MM-DD
		return `${year}-${month}-${day}`;
	};

	const updatedData = combustibles.map(item => { // CAMBIO: Usar llaves {} para un cuerpo de función explícito
		// Esto SÍ está permitido aquí:
		const campoEncontrado = campos.find(campo => campo.cCodigoCam === item.cCodigoCam);

		return { // Necesitas 'return' explícito
			// Campos de Afiactivo
			cCodigoAfi: item.cNumeconAfi?.trim(),
			vNombreAfi: item.vNombreAfi?.trim(),
			activo: item.cActivoAfi?.trim(),
			vMarcaAfi: item.vMarcaAfi?.trim(),
			vModeloAfi: item.vModeloAfi?.trim(),
			vNumserieAfi: item.vNumserieAfi?.trim(),
			cCodigorelAfi: item.vPlacasAfi?.trim(),
			cNoDepreciarAfi: item.cNoDepreciarAfi?.trim(),
			cOperativoAfi: item.cOperativoAfi?.trim(),
			cRutafactAfi: item.cRutafactAfi?.trim(),
			vPlacasAfi: item.vPlacasAfi?.trim(),

			// CORRECCIÓN: Nueva propiedad para el nombre del campo encontrado
			vNombreCam: campoEncontrado ? campoEncontrado.vNombreCam : null,

			// Campos de ZAfiactivoti (extras)
			idActivoAti: item.idActivoAti,
			cNumeconAfiExtra: item.cNumeconAfiExtra?.trim(),
			cReponsivaAti: item.cReponsivaAti?.trim(),
			cResponsableAti: item.cResponsableAti?.trim(),
			cCodigoCam: item.cCodigoCam?.trim(),
			vEmailAti: item.vEmailAti?.trim(),
			vPwdemailAti: item.vPwdemailAti?.trim(),
			vAntivirusAti: item.vAntivirusAti?.trim(),
			vOfficeAti: item.vOfficeAti?.trim(),
			vTipoAti: item.vTipoAti?.trim(),
			vMarcaAti: item.vMarcaAti?.trim(),
			vSerieAti: item.vSerieAti?.trim(),
			dFcompraAti: formatDateString(item.dFcompraAti),
			vNombrePrv: item.vNombrePrv?.trim(),
			nCostoAti: item.nCostoAti,
			dFgarantiaAti: formatDateString(item.dFgarantiaAti),
			vModeloAti: item.vModeloAti?.trim(),
			dFasignacionAti: formatDateString(item.dFasignacionAti),
			vVerwindowsAti: item.vVerwindowsAti?.trim(),
			vProcesadorAti: item.vProcesadorAti?.trim(),
			vMemoriaAti: item.vMemoriaAti?.trim(),
			vDiscoduroAti: item.vDiscoduroAti?.trim(),
			vUsreclipseAti: item.vUsreclipseAti?.trim(),
			vPwdeclipseAti: item.vPwdeclipseAti?.trim(),
			vUsrrdAti: item.vUsrrdAti?.trim(),
			vPwdremotoAti: item.vPwdremotoAti?.trim(),
			vComentariosAti: item.vComentariosAti?.trim(),
			vDocresponsivaAti: item.vDocresponsivaAti?.trim(),
			vDepartamentoAti: item.vDepartamentoAti?.trim(),

			//Nombre usuario asignado al equipo
			vNombreEmpleado: item.vNombreEmpleado?.trim(),
		};
	});

	return {
		data: updatedData,
		isLoading: isLoading,
		errorMessage: errorMessage,
	};
};