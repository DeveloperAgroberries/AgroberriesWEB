import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getVehicles } from "../../../store/slices/vehicles";
import { getRoutes } from "../../../store/slices/rutas";
import { getProviders } from "../../../store/slices/vehicleProviders";


export const CostoRutaKmList = () => {
  
    const dispatch = useDispatch();
    const {vehicles = []} = useSelector( (state) => state.vehicles );
    const {routes = []} = useSelector( (state) => state.routes );
    const {providers = []} = useSelector( (state) => state.providers );
    
    useEffect(() => {
        dispatch( getVehicles());
        dispatch( getRoutes());
        dispatch( getProviders());
    }, [])

    const updatedData = vehicles.map(item => ({
        ...item,
        cControlPrv: providers[item.cControlPrv] ? providers[item.cControlPrv].vNombrePrv : item.vNombrePrv,
      }));

    return (
        <>
        
            {
                updatedData.map( (data,index) =>(
                    <tr key={index + 1}>
                        <th scope="row">{index + 1}</th>
                        <td>{data.cControlPrv}</td>
                        <td>{data.cPlacaVeh}</td>
                        <td>{data.cCapacidadVeh}</td>
                        <td>{data.vTipoVeh}</td>
                
                    </tr>
                ))
            }
        </>
    )
}
