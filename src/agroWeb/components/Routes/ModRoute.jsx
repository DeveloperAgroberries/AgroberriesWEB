import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startUpdateRoutes } from '../../../store/slices/rutas';
import { AuthContext } from '../../../auth/context/AuthContext';
import { ZonesListForSelect } from '../ZoneListForSelect';
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';
import '../../../css/Popup.css';


export const ModRoute = ({ onClose }) => {

  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const { selRoutes = [] } = useSelector((state) => state.selRoutes);
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

  const { description, active, distance, cost, zone, onInputChange } = useForm({
    description: selRoutes.vDescripcionRut,
    active: selRoutes.cActivaRut,
    distance: selRoutes.nDistanciaRut,
    cost: selRoutes.nCostoRut,
    zone: selRoutes.cCodigoZon,
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Si es un checkbox, usamos el valor 'checked', de lo contrario, usamos 'value'
    const updatedValue = type === 'checkbox' ? checked : value;

    // Actualizar el estado del formulario
    onInputChange({
      target: {
        name,
        value: updatedValue,
      },
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (description === '' || distance === '' || cost === '' || zone === '') {
      setErrorMessage('Por favor, revisa los campos');
      return;
    } else {
      const route = {
        cControlRut: selRoutes.cControlRut,
        vDescripcionRut: description.toUpperCase().trim(),
        nDistanciaRut: distance,
        cActivaRut: active ? '1' : '0',
        nCostoRut: cost,
        cCodigoUsu: selRoutes.cCodigoUsu,
        cUsumodRut: user?.id,
        dModifiRut: dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
        cCodigoZon: zone
      };

      setErrorMessage('');

      const success = await dispatch(startUpdateRoutes(route));

      if (success) {
        onClose();
      } else {
        setErrorMessage('Error al actualizar la ruta. Intente nuevamente.');
      }
    }
  }

  return (
    <div className="popup-container">
      <div className="rounded-4 popup" style={{ fontSize: '13px'}}>
        <div className="rounded-3 mb-2" style={{ background: '#7c30b8', color: 'white', fontSize: '25px', textAlign: 'center' }}>
					<strong>Modificar Ruta</strong>
				</div>
        
        <div className='container'>
          <form >
            {/* Fila 1: Ruta y Distancia */}
            <div className="row mb-2">
              <div className="col-md-9">
                <label className="form-label mb-1">Ruta</label>
                <input style={{ fontSize: '12px' }} required type="text" className="form-control form-control-sm" name='description' value={description} onChange={onInputChange} onKeyDown={(e) => checkSpecialCharForRoute(e)} onPaste={onPaste} />
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1">Distancia</label>
                <input  style={{ fontSize: '12px' }} required type="number" className="form-control form-control-sm" name='distance' value={distance} onChange={onInputChange} onKeyDown={(e) => checkChar(e)} onPaste={onPaste} />
              </div>
            </div>

            {/* Fila 2: Costo, Zona y Switch */}
            <div className="row mb-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label mb-1">Costo</label>
                <input  style={{ fontSize: '12px' }} required type="number" className="form-control form-control-sm" name='cost' value={cost} onChange={onInputChange} />
              </div>
              <div className="col-md-5">
                <label className="form-label mb-1">Zona</label>
                <select  style={{ fontSize: '12px' }} required className="form-select form-select-sm" name='zone' value={zone} onChange={onInputChange}>
                  <option hidden value="">Seleccion</option>
                  <ZonesListForSelect />
                </select>
              </div>
              <div className="col-md-3 pb-1">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" name="active" checked={active} onChange={handleInputChange} />
                  <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Activa</label>
                </div>
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
