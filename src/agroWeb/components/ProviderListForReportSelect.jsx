import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProviders } from '../../store/slices/vehicleProviders';
import { AuthContext } from '../../auth/context/AuthContext';

export const ProvidersList = () => {

    const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
    const {providers =[]} = useSelector( (state) => state.providers );
    
    useEffect(() =>{
        dispatch( getProviders() );
    },[])

    //TODO: Agregar a la tabla de proveedores de la base de datos el usuario de ECLIPSE como columna nueva para poder hacer este filtro
    //Agregar en RegistroTrnasportes que si se logea un proveedor se desactiven todos los Select a excepcion de las fechas y el proveedor y que el uso de los 3 sea obligatorio para activar el boton de busqueda
    const filteredProviders = providers.filter(provider => provider.cUsuwebUsu === user.id);
    const providersToDisplay = filteredProviders.length > 0 ? filteredProviders : providers;

    return (
        <>
            {
                providersToDisplay.map( provider =>(
                    <option value={provider.vNombrePrv} key={provider.cControlPrv}>{provider.vNombrePrv}</option>
                ))
            }
        </>
    )
}
