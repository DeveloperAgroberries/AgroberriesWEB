
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviders } from '../../store/slices/vehicleProviders';

export const ProvidersListForSelect = () => {

  const dispatch = useDispatch();
  const {providers =[]} = useSelector( (state) => state.providers );
    
  useEffect(() =>{
    dispatch( getProviders() );
  },[dispatch])

  if(providers.length === 0) {
    return <option>Cargando proveedores...</option>
  }

  return (
    <>
      {
        providers.map( provider =>(
          <option value={parseInt(provider.cControlPrv)} key={parseInt(provider.cControlPrv)}>{provider.vNombrePrv}</option>
        ))
      }   
    </>
  )
}
