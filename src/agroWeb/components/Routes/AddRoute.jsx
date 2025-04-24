import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { ZonesListForSelect } from '../ZoneListForSelect';
import { useForm } from '../../../hooks';
import { startAddNewRoute } from '../../../store/slices/rutas';
import dayjs from 'dayjs';
import '../../../css/Popup.css';

export const AddRoute = ({ onClose }) => {

    const dispatch = useDispatch();
    const {user} = useContext(AuthContext);
	const [errorMessage, setErrorMessage] = useState('');
    const date = new Date()
    
    const checkSpecialCharForRoute =(e)=>{
      if(!/[0-9a-zA-Z ]/.test(e.key)){
       e.preventDefault();
      }
     };
  
     const checkChar =(e)=>{
      if(!/[0-9A-Z.]/.test(e.key)){
       e.preventDefault();
      }
     };

     const onPaste = (e) => {
      e.preventDefault();
    }

    const {description, distance, cost, zone, onInputChange} = useForm({
        description: '',
        distance: '',
        cost: '',
        zone:'',
    });

    const onSubmit = async( event ) =>{
        event.preventDefault();

        if(description === '' || distance === '' || cost === '' || zone === ''){
            setErrorMessage('Revisa que los campos contengan datos');
			return;
        }else{
            const route = {
                vDescripcionRut: description.toUpperCase().trim(),
                nDistanciaRut: distance,
				        cActivaRut: "1",
                nCostoRut: cost,
                cCodigoUsu: user?.id,
                dCreacionRut: dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
                cCodigoZon: zone
            }

            setErrorMessage('');
			const success = await dispatch(startAddNewRoute(route));
			if(success){
				onClose();
			} else {
				setErrorMessage('Error al agregar la ruta. Intente nuevamente.');
			}
		}
  	}

  return (
    <div className="popup-container">
    	<div className="rounded-4 popup">
        <h2>Agregar Ruta</h2>
        <div className='container'>
          <form>
            <div className="mb-3">
              <label className="form-label">Ruta</label>
              <input required type="text" className="form-control" aria-describedby="emailHelp" name='description' value={ description } onChange={ onInputChange } onKeyDown={(e)=>checkSpecialCharForRoute(e)} onPaste={onPaste}/>
            </div>
            <div className="mb-3">
              <label className="form-label">Distancia</label>
              <input required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='distance' value={ distance } onChange={ onInputChange } onKeyDown={(e)=>checkChar(e)} onPaste={onPaste}/>
            </div>
            <div className="mb-3">
              <label className="form-label">Costo</label>
              <input required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='cost' value={ cost } onChange={ onInputChange }/>
            </div>
            <div className="mb-3">
              <label className="form-label">Zona</label>
              <select required className="form-select" name='zone' value={ zone } onChange={ onInputChange }>
                <option hidden value="">Seleccion</option>
                <ZonesListForSelect/>
              </select>
            </div>
          </form>
        </div>

        {errorMessage && (
        	<div className="alert alert-danger" role="alert">
            	{errorMessage}
          	</div>
        )}
        
        <div className='container mb-1 mt-2'>
          <button className='btn btn-outline-success rounded-2 m-1'  onClick={ onSubmit }>Guardar</button>
          <button className='btn btn-outline-danger rounded-2 m-1' onClick={ onClose }>Cerrar</button>
        </div>
        
      </div>
    </div>
  );
};
