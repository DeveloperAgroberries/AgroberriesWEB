import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicles } from '../../store/slices/vehicles';

export const VehicleListForSelect = () => {
  const dispatch = useDispatch();
  const {vehicles =[]} = useSelector( (state) => state.vehicles );
    
  useEffect(() =>{
    dispatch( getVehicles() );
  },[])

  return (
    <>
      {
        vehicles.map( vehicle =>(
          <option value={vehicle.cPlacaVeh} key={vehicle.cControlVeh}>{vehicle.cPlacaVeh}</option>
        ))
      }   
    </>
  )
}
