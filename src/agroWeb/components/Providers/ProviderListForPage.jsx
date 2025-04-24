
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviders } from '../../../store/slices/vehicleProviders';
import { setActiveProvider } from '../../../store/slices/vehicleProviders/selProviderSlice';
import { Spinner } from 'react-bootstrap';

export const ProvidersListForPage = () => {

	const dispatch = useDispatch();
	const {providers =[], isLoading: isLoadingProviders, errorMessage: errorProviders} = useSelector( (state) => state.providers );

	const [selectedRow, setSelectedRow] = useState(null);
		
	useEffect(() =>{
		const fetchData = async () =>{
			await dispatch(getProviders());
		}
		fetchData();
	},[dispatch]);

	if(isLoadingProviders){
		return(
			<tr>
				<td colSpan="4" className="text-center">
					<Spinner animation='border' /> Cargando datos...
				</td>
			</tr>
		);
	}

	if(errorProviders){
		return(
			<tr>
				<td colSpan="4" className="text-center">
					<Alert variant="danger">
						{`Error al cargar proveedores: ${errorProviders}`}
					</Alert>
				</td>
			</tr>
		);
	}

	const handleRowClick = (id, vNombrePrv, user) => {
		setSelectedRow(id === selectedRow ? null : id);

		const provider = {
			cControlPrv: id,
			vNombrePrv: vNombrePrv.trim(),
			cCodigoUsu: user.trim()
		}

		dispatch( setActiveProvider({selProviders: provider}) );
	};

	return (
		<>
			{providers.length > 0 ? (
				providers.map( (provider, index) =>(
					<tr className={selectedRow === provider.cControlPrv ? 'table-active' : ''}
						key={index + 1}
						onClick={() => handleRowClick(
							provider.cControlPrv,
							provider.vNombrePrv,
							provider.cCodigoUsu
						)}>
								
						<th scope="row">{index + 1}</th>
						<td>{provider.vNombrePrv}</td>
						<td>{provider.cCodigoUsu}</td>
						<td>{provider.cUsumodPrv}</td>
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
	);
}
