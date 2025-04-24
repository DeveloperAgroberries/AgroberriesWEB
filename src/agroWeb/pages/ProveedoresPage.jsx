import { useState } from "react";
import { ProvidersListForPage } from "../components/Providers/ProviderListForPage"
import { AddProvider, ModProvider, DelProvider } from "../components/Providers";
import { useDispatch } from "react-redux";
import { getProviders } from "../../store/slices/vehicleProviders";

export const ProveedoresPage = () => {
		//.........................
	//En esta seccion entre pountos puede que se pueda mejorar el codigo por medio de thunks para el funcionamiento de popups
	const dispatch = useDispatch();
	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const openProviderPopup = (providerPopupComponent) => {
		setIsPopupOpen(providerPopupComponent);
	};

	const closeProviderPopup = async () => {
		setIsPopupOpen(null);
		await dispatch(getProviders());
	};
	//.......................................

	return (
		<>
			<hr/>
			<hr/>
			<hr/>

			<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
				<h1 className='text-center text-black text text'> Proveedores</h1>

				<div className="container-fluid overflow-auto" id="containerPagesTable">
					<table className="table table-bordered table-dark table-striped-columns table-hover">
						<thead className="sticky-top">
							<tr>
								<th scope="col">No.</th>
								<th scope="col">Nombre Proveedor</th>
								<th scope="col">Usuario Creador</th>
								<th scope="col">Usuario Modificador</th>
							</tr>
						</thead>
						<tbody>
							<ProvidersListForPage/>
						</tbody>
					</table>
				</div>

			<div className="ms-2 mb-1 mt-2">
				<button className="btn btn-outline-success rounded-2 m-1" onClick={ () => openProviderPopup(<AddProvider onClose={ closeProviderPopup }/>) }>Agregar</button>
				<button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openProviderPopup(<ModProvider onClose={ closeProviderPopup }/>) }>Modificar</button>
				{/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openProviderPopup(<DelProvider onClose={ closeProviderPopup }/>) }>Eliminar</button>	 */}
			</div>

			{isPopupOpen}
			</div>
		</>
	)
}
