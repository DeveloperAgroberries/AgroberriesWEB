import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { ListNominaCampo } from "../components/NominaCampo/NominaList";
import { Toast, ToastContainer, Col, Row } from 'react-bootstrap';
import { checkingIsLoadingNominaSlice, checkingShowView, resetFilters, setRegistrosNominaFilters } from "../../store/slices/nominaCampo/nominaCampoSlice";
import { getDepartamentos, getActividades } from '../../store/slices/nominaCampo/thunks';

export const NominaPage = () => {

  const dispatch = useDispatch();
  const [show, setShow] = useState(false);

  // --- Carga los departamentos cuando el componente se monta //////////////////////////////////////////////////////////////////}
  const [loadDep, setLoadDep] = useState(true);
  const { departamentos = [], isLoading: isLoadingDep, errorMessage: errorDep } = useSelector((state) => state.selNomina);
  useEffect(() => {
    dispatch(getDepartamentos());
    if (departamentos.length > 0 || errorDep) {
      setLoadDep(false);
    }
  }, [dispatch, isLoadingDep, departamentos.length, errorDep]); // Dependencias para volver a cargar si es necesario
  // --- Termina Carga los departamentos cuando el componente se monta ////////////////////////////////////////////////////////

  // --- Carga las actividades cuando el componente se monta //////////////////////////////////////////////////////////////////
  const { actividades = [], isLoading: isLoadingAct, errorMessage: errorAct } = useSelector((state) => state.selNomina);
  const [loadAct, setLoadAct] = useState(true);
  useEffect(() => {
    dispatch(getActividades());
    if (actividades.length > 0 || errorAct) {
      setLoadAct(false);
    }
  }, [dispatch, isLoadingAct, actividades.length, errorAct]); // Dependencias para volver a cargar si es necesario
  // --- Termina las actividades  cuando el componente se monta ////////////////////////////////////////////////////////

  const [filters, setFiltersState] = useState({
    selectedDate1: '',
    selectedDate2: '',
    departamento: '',
    actividad: ''
  });

  const [isSearchTriggered, setIsSearchTriggered] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(resetFilters());
    };
  }, [dispatch]);

  const cleanFilters = useCallback(() => {
    setFiltersState({
      selectedDate1: '',
      selectedDate2: '',
      departamento: '',
      actividad: ''
    });
    setIsSearchTriggered(false);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFiltersState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchRT = useCallback(() => {
    const filterRT = {
      startDate: filters.selectedDate1.trim(),
      endDate: filters.selectedDate2.trim(),
      departamento: filters.departamento.trim(),
      actividad: filters.actividad.trim()
    };

    if (!filterRT.startDate == '' && !filterRT.endDate == '' && !filterRT.departamento == '' && !filterRT.actividad == '') {
      // console.log("Filter RT:", filterRT);
      // return
      dispatch(resetFilters());
      dispatch(setRegistrosNominaFilters({ registrosNominaFilters: filterRT }));
      dispatch(checkingIsLoadingNominaSlice());
      dispatch(checkingShowView());
      setIsSearchTriggered(true);
    } else {
      // console.log("Filter RT esta vacio", filterRT);
      setShow(true);
    }
  }, [dispatch, filters]);

  return (
    <>
      <style type="text/css">
        {`
              /* Estilos para la tabla HTML nativa */

              .table tbody tr:hover {
                  --bs-table-hover-bg: #d19ff9 !important; /* Color que tenías */  
              }

              /* Estilo para las filas al pasar el ratón */
              .table tbody tr:hover {
                  background-color: #d19ff9 !important; /* Color que tenías */
                  {/* cursor: pointer; */}
              }

              /* Estilos para los encabezados de la tabla */
              .table thead th {
                  padding-left: 8px;
                  padding-right: 8px;
                  font-size: 14px;
                  font-weight: bold;
                  background-color: #7c30b8; /* Color de fondo que tenías */
                  color: white; /* Color de texto que tenías */
              }

              /* Estilos para body de la tabla */
              .table tbody td {
                  padding-left: 8px;
                  padding-right: 8px;
                  font-size: 12px;
                  white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
              }

              /* Redondear esquinas del encabezado */
              .table thead th:first-child {
                  border-top-left-radius: 8px;
              }
              .table thead th:last-child {
                  border-top-right-radius: 8px;
              }

              /* Estilo para las celdas del cuerpo */
              .mi-tabla-activos tbody td {
                  min-height: 30px; /* Puedes ajustar esto */
                  padding-left: 8px;
                  padding-right: 8px;
              }

              /* Opcional: Redondear también las esquinas inferiores de la tabla (siempre y cuando la tabla no tenga scroll interno que las oculte) */
              .table tbody tr:last-child td:first-child {
                  border-bottom-left-radius: 8px;
              }
              .table tbody tr:last-child td:last-child {
                  border-bottom-right-radius: 8px;
              }

              .sizeLetra{
                font-size: 13px;
              }
          `}
      </style>
      <br />
      <br />
      <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">

        <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
          <strong>Nómina de campo</strong>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3" style={{ marginBottom: '1%' }}>
          <p className="m-0">Consulta movimientos de nómina de campo.</p>
        </div>

        <div className="container-fluid overflow-auto m-2" style={{ display: "flex" }}>
          <div className="mb-2 me-3">
            <div><label className="form-label m-1">Fecha Inicio</label></div>
            <div><input className="form-control sizeLetra" type="date" value={filters.selectedDate1} name="selectedDate1" onChange={handleInputChange}></input></div>
          </div>

          <div className="mb-2 me-3">
            <div><label className="form-label m-1">Fecha Fin</label></div>
            <div><input className="form-control sizeLetra" type="date" value={filters.selectedDate2} name="selectedDate2" onChange={handleInputChange}></input></div>
          </div>

          <div className="mb-2 me-3">
            <div><label className="form-label m-1">Departamento</label></div>
            <div>
              <select className="form-select sizeLetra" value={filters.departamento} name="departamento" onChange={handleInputChange}>
                {loadDep ? (<option value="">Cargando Departamentos...</option>) : (<option value="">Selecciona Departamento</option>)}
                {departamentos.map((dep) => (
                  <option key={dep.cCodigoLug} value={dep.cCodigoLug}>
                    {dep.vNombreLug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-2 me-3" style={{ width: '530px' }}>
            <div><label className="form-label m-1">Actividades</label></div>
            <div>
              <select className="form-select sizeLetra" value={filters.actividad} name="actividad" onChange={handleInputChange}>
                {loadAct ? (<option value="">Cargando Actividades...</option>) : (<option value="">Selecciona Actividad</option>)}
                {actividades.map((act) => (
                  <option key={act.cCodigoAct} value={act.cCodigoAct}>
                    {act.cCodigoAct}- {act.vNombreAct}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* <div className="mb-2 me-3">
            <div><label className="form-label m-1">Actividad</label></div>
            <div><input className="form-control" type="date" value={filters.selectedDate2} name="actividad" onChange={handleInputChange}></input></div>
          </div> */}

          <div className="mt-2">
            <button className="btn btn-warning rounded-2 m-1 mt-4" onClick={handleSearchRT} >Buscar</button>
          </div>

          <div className="mt-2">
            <button className="btn btn-secondary rounded-2 m-1 mt-4" onClick={cleanFilters} ><i className="fas fa-filter fa-sm"></i> Limpiar</button>
          </div>
        </div>

        {/* --- AHORA AÑADE LA ESTRUCTURA DE LA TABLA HTML --- */}
        <div className="table-responsive" style={{ maxHeight: '550px' }}>
          <table className="table table-striped table-hover">{/* Puedes añadir tus propias clases CSS */}
            <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
              <tr>
                {/* <th>Cod Emp</th> */}
                <th className='text-center'>Temp</th>
                <th>Fecha</th>
                <th>Trabajador</th>
                <th>Departamento</th>
                <th>Lote</th>
                <th>Cultivo</th>
                <th>Actividad</th>
                <th>Cantidad</th>
                {/* <th>Nomina Asi</th> */}
                <th>Dispositivo</th>
                {/* <th>Cod_Lib</th>
                <th>Tipo Nht</th>
                <th>Cod_Lab</th>
                <th>Num Lab</th>
                <th>Tipo Destajo Nht</th> */}
                <th>Cod_Tam</th>
                <th>Tipo act</th>
                <th>Cod_Env</th>
              </tr>
            </thead>
            <tbody>
              <ListNominaCampo isSearchTriggered={isSearchTriggered} />
            </tbody>
          </table>
        </div>

        <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1, marginTop: "7%" }}>
          <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
            <Toast.Header style={{ background: "red", color: "white" }}>
              {/* <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" /> */}
              <strong className="me-auto">¡Error al buscar!</strong>
              <small></small>
            </Toast.Header>
            <Toast.Body style={{ background: "white" }}>Tienes que llenar todos los filtros de busqueda.</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}> */}
        {/* <DataTable
          className="mi-tabla-activos"
          customStyles={customStyles}
          columns={columns}
          data={data}
          fixedHeader
          fixedHeaderScrollHeight="400px" // Define la altura máxima de la tabla antes de que aparezca la barra de desplazamiento
        /> */}
        {/* </div> */}
      </div>
    </>
  )
}
