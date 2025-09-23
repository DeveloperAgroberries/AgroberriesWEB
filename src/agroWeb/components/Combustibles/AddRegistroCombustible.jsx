import React, { useEffect, useState, useContext, useRef } from 'react'; // Importa useRef
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import { getCombustibles, getCampos, getTrabajador, getActivo, startAddRegistroCombustible } from "../../../store/slices/combustiblesMod";
import { useForm } from '../../../hooks';
import dayjs from 'dayjs';

export const AddRegistroCombustible = ({ onClose, isModalOpen }) => {
  const dispatch = useDispatch();
  const [errorMessageInsert, setErrorMessageInsert] = useState('');
  const { user } = useContext(AuthContext);
  const ocultar = false

  //Campos
  const campos = useSelector(state => state.combustiblesMod.campos);
  const isLoadingCampos = useSelector(state => state.combustiblesMod.isLoadingCampos);
  const errorMessageCampos = useSelector(state => state.combustiblesMod.errorMessageCampos);

  //Buscar trabajador
  const searchResultsTrabajadores = useSelector(state => state.combustiblesMod.trabajador);
  const isLoadingTrabajador = useSelector(state => state.combustiblesMod.isLoadingTrabajador);
  const errorMessageTrabajador = useSelector(state => state.combustiblesMod.errorMessageTrabajador);
  const [searchCodTrabajor, setSearchTrabajador] = useState('');
  const [mostrarListaTrabajadores, setMostrarListaTrabajadores] = useState(false);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);
  const [mostrarDetallesTrabajadores, setMostrarDetallesTrabajadores] = useState(false);
  const [nombreTrabajadorSeleccionado, setNombreTrabajadorSeleccionado] = useState('');
  const isFirstRender = useRef(true); // Ref para controlar la primera renderización

  const handleSearchCodTrabajorChange = (event) => {
    const searchText = event.target.value;
    setSearchTrabajador(searchText);
    setMostrarListaTrabajadores(searchText.length >= 5);
    setMostrarDetallesTrabajadores(false); // Ocultar detalles al cambiar búsqueda
    setSelectedTrabajador(null);
    setNombreTrabajadorSeleccionado('');

    if (searchText.length >= 5) {
      dispatch(getTrabajador(searchText));
    } else {
      setMostrarListaTrabajadores(false); // Ocultar la lista si no hay suficientes caracteres
    }
  };
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Evita la ejecución en la primera renderización
    }

    // Si searchResultsTrabajadores es un objeto (y no está vacío), lo seleccionamos
    if (typeof searchResultsTrabajadores === 'object' && searchResultsTrabajadores !== null && Object.keys(searchResultsTrabajadores).length > 0) {
      setSelectedTrabajador(searchResultsTrabajadores);
      setNombreTrabajadorSeleccionado(`${searchResultsTrabajadores.vNombreTra} ${searchResultsTrabajadores.vApellidopatTra} ${searchResultsTrabajadores.vApellidomatTra}`.trim());
      setMostrarListaTrabajadores(false); // Ocultar la lista
      setMostrarDetallesTrabajadores(true); // Mostrar el input del nombre
    } else if (searchCodTrabajor.length >= 5) {
      setMostrarListaTrabajadores(true); // Mostrar la lista si la API devuelve un array o no encuentra nada como objeto
      setSelectedTrabajador(null);
      setNombreTrabajadorSeleccionado('');
    } else {
      setMostrarListaTrabajadores(false);
      setSelectedTrabajador(null);
      setNombreTrabajadorSeleccionado('');
    }
  }, [searchResultsTrabajadores]); // Depende solo de searchResultsTrabajadores
  const handleSelectTrabajador = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setNombreTrabajadorSeleccionado(`${searchResultsTrabajadores.vNombreTra} ${searchResultsTrabajadores.vApellidopatTra} ${searchResultsTrabajadores.vApellidomatTra}`.trim());
    setSearchTrabajador(trabajador.cCodigoTra.trim()); // Mostrar el código en el input de búsqueda
    setMostrarListaTrabajadores(false);
    setMostrarDetallesTrabajadores(true); // Mostrar el input del nombre
  };
  useEffect(() => {
    // console.log("entre al trabajador");
    if(nombreTrabajadorSeleccionado.length === 0){
      setNombreTrabajadorSeleccionado('');
    }
  }, [nombreTrabajadorSeleccionado]);

  //Buscar activo fijo
  const searchActivo = useSelector(state => state.combustiblesMod.activo);
  const isLoadingActivo = useSelector(state => state.combustiblesMod.isLoadingActivo);
  const errorMessageActivo = useSelector(state => state.combustiblesMod.errorMessageActivo);
  const [searchCodActivo, setSearchActivo] = useState('');
  const [mostrarListaActivo, setMostrarListaActivo] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState(null); //En este ejemplo selectedActivo no se usa por que no se guarda
  const [mostrarDetallesActivo, setMostrarDetallesActivo] = useState(false);
  const [nombreActivoSeleccionado, setNombreActivoSeleccionado] = useState('');
  const isFirstRenderActivo = useRef(true); // Ref para controlar la primera renderización

  const [selectCampo, setSelectCampo] = useState(''); 

  const handleSearchCodActivoChange = (event) => {
    const searchText = event.target.value;
    setSearchActivo(searchText);
    setMostrarListaActivo(searchText.length >= 5);
    setMostrarDetallesTrabajadores(false); // Ocultar detalles al cambiar búsqueda
    setSelectedActivo(null);
    setNombreActivoSeleccionado('');

    if (searchText.length >= 5) {
      dispatch(getActivo(searchText));
    } else {
      setMostrarListaActivo(false); // Ocultar la lista si no hay suficientes caracteres
    }
  };
  useEffect(() => {
    if (isFirstRenderActivo.current) {
      isFirstRenderActivo.current = false;
      return; // Evita la ejecución en la primera renderización
    }

    // Si searchActivo es un objeto (y no está vacío), lo seleccionamos
    if (typeof searchActivo === 'object' && searchActivo !== null && Object.keys(searchActivo).length > 0) {
      setSelectedActivo(searchActivo);
      setNombreActivoSeleccionado(`${searchActivo.nombreAfi}`.trim());
      setMostrarListaActivo(false); // Ocultar la lista
      setMostrarDetallesActivo(true); // Mostrar el input del nombre
    } else if (searchActivo.length >= 5) {
      setMostrarListaActivo(true); // Mostrar la lista si la API devuelve un array o no encuentra nada como objeto
      setSelectedActivo(null);
      setNombreActivoSeleccionado('');
    } else {
      setMostrarListaActivo(false);
      setSelectedActivo(null);
      setNombreActivoSeleccionado('');
    }
  }, [searchActivo]); // Depende solo de searchActivo
  const handleSelectActivo = (activo) => {
    setSelectedActivo(activo);
    setNombreActivoSeleccionado(`${searchActivo.nombreAfi}`.trim());
    setSearchActivo(activo.numecon.trim()); // Mostrar el código en el input de búsqueda
    setMostrarListaActivo(false);
    setMostrarDetallesActivo(true); // Mostrar el input del nombre
  };
  useEffect(() => {
    // console.log("entre al activo");
    if(nombreActivoSeleccionado.length === 0){
      setNombreActivoSeleccionado('');
    }
  }, [nombreActivoSeleccionado]);

  useEffect(() => {
    dispatch(getCampos());
  }, [dispatch]);

  const {
    // activoFijo,
    nombreActivo,
    odometro,
    tipoCom,
    litrosCargados,
    cCodigoCam,
    actividad,
    precioCombustible,
    // zona,
    onInputChange
  } = useForm({
    // activoFijo: '',
    nombreActivo: '',
    odometro: '',
    tipoCom: '',
    litrosCargados: '',
    cCodigoCam: '',
    actividad: '',
    precioCombustible: '',
    // zona: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nombreCompleto = `${selectedTrabajador.vNombreTra} ${selectedTrabajador.vApellidopatTra} ${selectedTrabajador.vApellidomatTra}`.trim();

    if (searchCodActivo === '' || cCodigoCam === '' || odometro === '' ||
      actividad === '' || tipoCom === '' || litrosCargados === '' || nombreCompleto === '' || searchCodTrabajor === '') {
      setErrorMessageInsert("Revisa que los campos contengan datos");
      return;
    } else {
      const registro = {
        // cControlCom: '', // SE INSERTA AUTOMATICAMENTE DESDE LA API
        dConsumoCom: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        cSemanaCom: semana,
        cNumeconAfi: searchCodActivo,
        nKmCom: odometro,
        cCodigoTra: searchCodTrabajor,
        vNombreTra: nombreCompleto,
        cManualCom: "0",
        cTipoCom: tipoCom,
        nLitrosCom: litrosCargados,
        cCodigoCam: cCodigoCam,
        cCodigoAct: actividad,
        cCodigoZon: selectCampo, // SE INSERTA AUTOMATICAMENTE DESDE LA API
        cCodigoUsu: user?.id,
        dCreacionCom: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        nPrecioCom: precioCombustible
      };
      // console.log(registro);
      //dispatch(getCombustibles()); //Solo con esto se actualiza la tabla de activos
      // onClose();
      // return;

      const success = await dispatch(startAddRegistroCombustible(registro));
      if (success) {
        dispatch(getCombustibles()); 
        onClose();
      } else {
        setErrorMessageInsert('Error al agregar el registro.Intente nuevamente');
      }
    }
  };

  const [fecha, setFecha] = useState('');
  const [semana, setSemana] = useState('');
  useEffect(() => {
    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];
    setFecha(fechaFormateada);
    setSemana(obtenerNumeroSemanaISO(hoy).toString());
  }, []);

  const obtenerNumeroSemanaISO = (fecha) => {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaDeLaSemana = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - diaDeLaSemana);
    const primerDiaDelAño = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const numeroDeSemana = Math.ceil((((d - primerDiaDelAño) / 86400000) + 1) / 7);
    return numeroDeSemana;
  };

  const handleSelectCampo = (campo) => {
    // console.log("Campo seleccionado:", campo);
    setSelectCampo(`${campo.cCodigoZon}`);
  }
  useEffect(() => {
    // console.log("Valor de selectCampo después de la actualización:", selectCampo);
    // Aquí puedes realizar otras acciones que dependan del nuevo valor de selectCampo
  }, [selectCampo]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Fecha</label>
          <input type="date" className="form-control" name="fecha" value={fecha} readOnly />
        </div>
        <div className="col">
          <label className="form-label">Semana</label>
          <input type="text" className="form-control" name="semana" value={semana} readOnly />
        </div>
      </div>

      {/* Buscar activo fijo */}
      <div className="mb-3">
        {/* <input type="text" className="form-control" name="activoFijo" placeholder="Activo Fijo" value={activoFijo} onChange={onInputChange} required /> */}
        <input
          type="text"
          className="form-control"
          id="searchCodActivo"
          placeholder="Buscar Activo..."
          value={searchCodActivo}
          onChange={handleSearchCodActivoChange}
          required
        />
        {isLoadingActivo && <div className="form-text">Buscando...</div>}

        {mostrarListaActivo && typeof searchActivo === 'object' && searchActivo !== null && Object.keys(searchActivo).length > 0 && (
          <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
            <li
              key={searchActivo.numecon}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelectActivo(searchActivo)}
            >
              {searchActivo.nombreAfi}
              <small className="text-muted"> - Código {searchActivo.numecon.trim()}</small>
            </li>
          </ul>
        )}

        {mostrarListaActivo && Array.isArray(searchActivo) && searchActivo.length > 0 && (
          <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
            {searchActivo.map(activo => (
              <li
                key={activo.numecon}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectActivo(activo)}
              >
                {activo.nombreAfi}
                <small className="text-muted"> - Código {activo.numecon.trim()}</small>
              </li>
            ))}
          </ul>
        )}

        {errorMessageActivo && <div className="form-text text-danger">{errorMessageActivo}</div>}
      </div>
      <div className="row mb-3">
        {/* {mostrarDetallesActivo && ( */}
        <div className="col">
          <label htmlFor="nombreActivo" className="form-label">Nombre Activo Fijo</label>
          <input
            type="text"
            className="form-control"
            id="nombreTrabajador"
            value={nombreActivoSeleccionado}
            readOnly
          />
        </div>
        {/* )} */}
        {/* ****** */}

        <div className="col">
          <label htmlFor="odometro" className="form-label">Odómetro</label>
          <input type="text" className="form-control" name="odometro" placeholder="Registrar Km" value={odometro} onChange={onInputChange} required />
        </div>
      </div>

      {/* Buscar trabajador */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="searchCodTrabajor" className="form-label">Código Trabajador</label>
          <input
            type="text"
            className="form-control"
            id="searchCodTrabajor"
            placeholder="Buscar trabajador..."
            value={searchCodTrabajor}
            onChange={handleSearchCodTrabajorChange}
            required
          />
          {isLoadingTrabajador && <div className="form-text">Buscando...</div>}
          {mostrarListaTrabajadores && typeof searchResultsTrabajadores === 'object' && searchResultsTrabajadores !== null && Object.keys(searchResultsTrabajadores).length > 0 && (
            <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
              <li
                key={searchResultsTrabajadores.cCodigoTra}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectTrabajador(searchResultsTrabajadores)}
              >
                {searchResultsTrabajadores.vNombreTra}
                <small className="text-muted"> - Código {searchResultsTrabajadores.cCodigoTra.trim()}</small>
              </li>
            </ul>
          )}
          {mostrarListaTrabajadores && Array.isArray(searchResultsTrabajadores) && searchResultsTrabajadores.length > 0 && (
            <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
              {searchResultsTrabajadores.map(trabajador => (
                <li
                  key={trabajador.cCodigoTra}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectTrabajador(trabajador)}
                >
                  {trabajador.vNombreTra}
                  <small className="text-muted"> - Código {trabajador.cCodigoTra.trim()}</small>
                </li>
              ))}
            </ul>
          )}
          {errorMessageTrabajador && <div className="form-text text-danger">{errorMessageTrabajador}</div>}
        </div>
        {/* {mostrarDetallesTrabajadores && ( */}
        <div className="col-md-6">
          <label htmlFor="nombreTrabajador" className="form-label">Nombre Trabajador</label>
          <input
            type="text"
            className="form-control"
            id="nombreTrabajador"
            value={nombreTrabajadorSeleccionado}
            readOnly
          />
        </div>
        {/* )} */}
      </div>
      {/* **** */}

      <div className="row mb-4">
        <div className="col">
          <label htmlFor="tipoCom" className="form-label">Combustible</label>
          <select className="form-select" name="tipoCom" id="tipoCom" value={tipoCom} onChange={onInputChange} required>
            <option value="" hidden>Seleccionar tipo</option>
            <option value="1">Gasolina</option>
            <option value="2">Diesel</option>
          </select>
        </div>
        <div className="col">
          <label htmlFor="litrosCargados" className="form-label">Litros Cargados</label>
          <input type="text" className="form-control" name="litrosCargados" placeholder="Ingresar litros cargados" value={litrosCargados} onChange={onInputChange} required />
        </div>
        <div className="col">
          <label htmlFor="precioCombustible" className="form-label">Precio Combustible</label>
          <input type="text" className="form-control" name="precioCombustible" placeholder="Ingresar precio por litro" value={precioCombustible} onChange={onInputChange} required />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="Campo" className="form-label">Campo</label>
        <select className="form-select" name='cCodigoCam' value={cCodigoCam} onChange={onInputChange} required>
          <option hidden value="">Seleccionar</option>
          {isLoadingCampos && <option disabled>Cargando campos...</option>}
          {errorMessageCampos && <option disabled className="text-danger">Error al cargar campos</option>}
          {campos && campos.map(campoItem => (
            <option key={campoItem.cCodigoCam} value={campoItem.cCodigoCam} onClick={() => handleSelectCampo(campoItem)}>
              {campoItem.vNombreCam}
            </option>
          ))}
        </select>
        <br />
        {ocultar  && (<div className="col" >
          <label htmlFor="zona" className="form-label">Zona</label>
          <input type="text" className="form-control" name="zona" placeholder="zona" value={selectCampo} onChange={onInputChange} required />
        </div>)}
      </div>

      <div className="mb-3">
        <label htmlFor="actividad" className="form-label">Actividad</label>
        <select className="form-select" name="actividad" id="actividad" value={actividad} onChange={onInputChange} required>
          <option value="" hidden>Seleccionar actividad</option>
          <option value="1706">Fumigación</option>
          <option value="4457">Producción</option>
          <option value="0160">Cosecha</option>
        </select>
        <br />
        {errorMessageInsert && (
          <div className="alert alert-danger" role="alert">
            {errorMessageInsert}
          </div>
        )}
      </div>

      <div className="text-end">
        <button type="submit" className="btn btn-success">Guardar</button>
      </div>
    </form>
  );
};