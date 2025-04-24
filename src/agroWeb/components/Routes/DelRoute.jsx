import { useDispatch, useSelector } from 'react-redux';
import { useForm } from '../../../hooks';
import { startDeleteRoutes } from '../../../store/slices/rutas';
import '../../../css/Popup.css';
import { useState } from 'react';

export const DelRoute = ({ onClose }) => {

  const dispatch = useDispatch();
  const { selRoutes = []} = useSelector( (state) => state.selRoutes );
  const [ errorMessage, setErrorMessage ] = useState('');

  const {description} = useForm({
    description: selRoutes.vDescripcionRut,
  });

	const onSubmit = async( event ) =>{
    	event.preventDefault();

		if(description === ''){
			setErrorMessage('Revisa que los campos contengan datos');
			return;
    	}else{
			setErrorMessage('');
			const success = await dispatch( startDeleteRoutes(selRoutes.cControlRut) );
			if(success){
				onClose();
			}else{
				setErrorMessage('Error al eliminar la ruta. Intente nuevamente.');
			}
    	}
	}

  return (
    <div className="popup-container">
      <div className="rounded-4 popup">
        <h2>Eliminar Ruta</h2>
        <hr/>
        <div className='container'>
          <form>
          <div className="mb-3">
              <label className="form-label">Ruta</label>
              <input disabled type="text" className="form-control" aria-describedby="emailHelp" name='description' value={ description } />
            </div>
          </form>
        </div>

		{errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <h5>Desea eliminar esta Ruta?</h5>
        <div className='container mb-1 mt-2'>
          <button className='btn btn-outline-danger rounded-2 m-1' onClick={ onSubmit }>Eliminar</button>
          <button className='btn btn-outline-warning rounded-2 m-1' onClick={ onClose }>Regresar</button>
        </div>
        
      </div>
    </div>
  );
};
