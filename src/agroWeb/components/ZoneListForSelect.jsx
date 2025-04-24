import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getZones } from '../../store/slices/zones';

export const ZonesListForSelect = () => {
  const dispatch = useDispatch();
  const {zones =[]} = useSelector( (state) => state.zones );

  useEffect(() =>{
    dispatch( getZones() );
  },[])

  return (
    <>
      {
        zones.map( zone =>(
          <option value={zone.cCodigoZon} key={zone.cCodigoZon}>{zone.vNombreZon}</option>
        ))
      }   
    </>
  )
}
