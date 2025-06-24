import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActivos, getSubFamilias } from "../../../store/slices/combustibles";
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
  
	useEffect(() => {
	  const fetchData = async () => {
		await dispatch(getActivos());
		dispatch(getSubFamilias());
	  };
	  fetchData();
	}, [dispatch]); // Añade dispatch como dependencia para evitar warnings
  
	const updatedData = combustibles.map(item => ({
	  cCodigoAfi: item.cNumeconAfi.trim(),
	  vNombreAfi: item.vNombreAfi.trim(),
	  activo: item.cActivoAfi.trim() === '1' ? 'Activo' : 'Inactivo', // Cambiamos el formato para DataTable
	  vMarcaAfi: item.vMarcaAfi ? item.vMarcaAfi.trim() : null,
	  vModeloAfi: item.vModeloAfi ? item.vModeloAfi.trim() : null,
	  vNumserieAfi: item.vNumserieAfi ? item.vNumserieAfi.trim() : null,
	  cCodigorelAfi: item.vPlacasAfi ? item.vPlacasAfi.trim() : null,
	  cNoDepreciarAfi: item.cNoDepreciarAfi? item.cNoDepreciarAfi?.trim() : null,
	  cOperativoAfi: item.cOperativoAfi? item.cOperativoAfi?.trim() : null,
	  cRutafactAfi: item.cRutafactAfi? item.cRutafactAfi?.trim() : null,
	}));

	return {
	  data: updatedData,
	  isLoading: isLoading,
	  errorMessage: errorMessage,
	};
  };