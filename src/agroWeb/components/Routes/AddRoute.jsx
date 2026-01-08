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
  const { user } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState('');
  const date = new Date()

  const checkSpecialCharForRoute = (e) => {
    if (!/[0-9a-zA-Z ]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const checkChar = (e) => {
    if (!/[0-9A-Z.]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
  }

  const { description, distance, cost, zone, onInputChange } = useForm({
    description: '',
    distance: '',
    cost: '',
    zone: '',
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (description === '' || distance === '' || cost === '' || zone === '') {
      setErrorMessage('Revisa que los campos contengan datos');
      return;
    } else {
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
      if (success) {
        onClose();
      } else {
        setErrorMessage('Error al agregar la ruta. Intente nuevamente.');
      }
    }
  }

  return (
    <div className="popup-container">
      <div className="rounded-4 popup" style={{ fontSize: '13px' }}>
        <div className="rounded-3 mb-2" style={{ background: '#7c30b8', color: 'white', fontSize: '25px', textAlign: 'center' }}>
          <strong>Agregar Ruta</strong>
        </div>
        <div className='container'>
          <form>
            {/* Fila 1: Ruta y Distancia */}
            <div className="row mb-2">
              <div className="col-md-6">
                <label className="form-label">Ruta</label>
                <input style={{ fontSize: '13px' }} required type="text" className="form-control" aria-describedby="emailHelp" name='description' value={description} onChange={onInputChange} onKeyDown={(e) => checkSpecialCharForRoute(e)} onPaste={onPaste} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Distancia</label>
                <input style={{ fontSize: '13px' }} required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='distance' value={distance} onChange={onInputChange} onKeyDown={(e) => checkChar(e)} onPaste={onPaste} />
              </div>
            </div>

            {/* Fila 2: Costo y Zona */}
            <div className="row mb-2">
              <div className="col-md-6">
                <label className="form-label">Costo</label>
                <input style={{ fontSize: '13px' }} required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1" name='cost' value={cost} onChange={onInputChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Zona</label>
                <select style={{ fontSize: '13px' }} required className="form-select" name='zone' value={zone} onChange={onInputChange}>
                  <option hidden value="">Seleccion</option>
                  <ZonesListForSelect />
                </select>
              </div>
            </div>
          </form>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <hr></hr>
        <div className='container mb-1 mt-2'>
          <button className='btn btn-success rounded-2 m-1' onClick={onSubmit}>Guardar</button>
          <button className='btn btn-danger rounded-2 m-1' onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
};
