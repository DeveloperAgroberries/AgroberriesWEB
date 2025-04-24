import { useState } from "react";
import { VehiclesList } from "../components/Vehicles/VehiclesList";
import { AddVehicle, ModVehicle, DelVehicle} from "../components/Vehicles";
import { useDispatch } from "react-redux";
import { getVehicles } from "../../store/slices/vehicles";


export const VehiculosPage = () => {
  //.........................
  //En esta seccion entre pountos puede que se pueda mejorar el codigo por medio de thunks para el funcionamiento de popups
	const dispatch = useDispatch();
  	const [isPopupOpen, setIsPopupOpen] = useState(false);

  	const openVehiclePopup = (vehiclePopupComponent) => {
    	setIsPopupOpen(vehiclePopupComponent);
  	};

	const closeVehiclePopup = async () => {
    	setIsPopupOpen(null);
		await dispatch(getVehicles());
  	};
//.......................................

	return (
    	<>
			<hr/>
			<hr/>
			<hr/>

			<div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
				<h1 className='text-center text-black text text'> Vehiculos</h1>
				<div className="container-fluid overflow-auto" id="containerPagesTable">
					<table className="table table-bordered table-dark table-striped-columns table-hover" >
						<thead>
							<tr>
								<th scope="col">No.</th>
								<th scope="col">Placas</th>
								<th scope="col">Vehiculo Activo</th>
								<th scope="col">Capacidad</th>
								<th scope="col">Tipo</th>
								<th scope="col">Usuario Creador</th>
								<th scope="col">Usuario Modificador</th>
							</tr>
						</thead>
						<tbody>
							<VehiclesList/>
						</tbody>
						
					</table>
				</div>
					
				<div className="ms-2 mb-1 mt-2">
					<button className="btn btn-outline-success rounded-2 m-1" onClick={ () => openVehiclePopup(<AddVehicle onClose={ closeVehiclePopup }/>) }>Agregar</button>
					<button className="btn btn-outline-primary rounded-2 m-1" onClick={ () => openVehiclePopup(<ModVehicle onClose={ closeVehiclePopup }/>) }>Modificar</button>
					{/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openVehiclePopup(<DelVehicle onClose={ closeVehiclePopup }/>) }>Eliminar</button> */}
				</div>
		
				{isPopupOpen}
    		</div>
    	</>
  	)
}
