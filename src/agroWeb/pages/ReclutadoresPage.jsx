import { useEffect, useState, useCallback } from 'react'; // <--- Importamos useCallback
import { useDispatch, useSelector } from 'react-redux';
import { startLoadingReclutadores, startSearchCandidatos, startUpdatePagoCandidatos, startSaveNominaCodes } from '../../store/slices/reclutadores/thunks';
import { setCandidatos } from '../../store/slices/reclutadores/reclutadoresSlice';
import { getActividades } from '../../store/slices/nominaCampo/thunks';
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const urlServer = import.meta.env.VITE_API_URL_FOTOS_PRUEBAS;

const datosPrueba = [
    // --- ENERO (Pocos registros, inicio de temporada) ---
    { iIdcandidato: 101, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Roberto Gomez', dFecharegistro: '2026-01-05', cPagado: '1' },
    { iIdcandidato: 102, vNomreclutador: '01006 - Almicar', vLorigen: 'TAPALPA', vNomcandidato: 'Ana Silvia Lujan', dFecharegistro: '2026-01-12', cPagado: '1' },
    { iIdcandidato: 103, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Marcos Rivas', dFecharegistro: '2026-01-20', cPagado: '0' },
    { iIdcandidato: 104, vNomreclutador: '01006 - Almicar', vLorigen: 'SAYULA', vNomcandidato: 'Lucia Mendez', dFecharegistro: '2026-01-25', cPagado: '1' },
    { iIdcandidato: 105, vNomreclutador: '01003 - Alfredo', vLorigen: 'CD GUZMAN', vNomcandidato: 'Ricardo Tapia', dFecharegistro: '2026-01-28', cPagado: '0' },

    // --- FEBRERO (Aumento de reclutamiento) ---
    { iIdcandidato: 201, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Beatriz Vega', dFecharegistro: '2026-02-02', cPagado: '1' },
    { iIdcandidato: 202, vNomreclutador: '01006 - Almicar', vLorigen: 'TAPALPA', vNomcandidato: 'Carlos Slim Helu', dFecharegistro: '2026-02-05', cPagado: '1' },
    { iIdcandidato: 203, vNomreclutador: '01006 - Almicar', vLorigen: 'SAYULA', vNomcandidato: 'Diana Salazar', dFecharegistro: '2026-02-08', cPagado: '0' },
    { iIdcandidato: 204, vNomreclutador: '01003 - Alfredo', vLorigen: 'CD GUZMAN', vNomcandidato: 'Esteban Quito', dFecharegistro: '2026-02-12', cPagado: '1' },
    { iIdcandidato: 205, vNomreclutador: '01006 - Almicar', vLorigen: 'SAYULA', vNomcandidato: 'Fernando Colunga', dFecharegistro: '2026-02-15', cPagado: '0' },
    { iIdcandidato: 206, vNomreclutador: '01003 - Alfredo', vLorigen: 'TAPALPA', vNomcandidato: 'Gabriela Spanic', dFecharegistro: '2026-02-18', cPagado: '1' },
    { iIdcandidato: 207, vNomreclutador: '01006 - Almicar', vLorigen: 'SAYULA', vNomcandidato: 'Hugo Sanchez', dFecharegistro: '2026-02-22', cPagado: '1' },
    { iIdcandidato: 208, vNomreclutador: '01003 - Alfredo', vLorigen: 'CD GUZMAN', vNomcandidato: 'Iris Chacón', dFecharegistro: '2026-02-25', cPagado: '0' },
    { iIdcandidato: 209, vNomreclutador: '01006 - Almicar', vLorigen: 'SAYULA', vNomcandidato: 'Jorge Campos', dFecharegistro: '2026-02-27', cPagado: '1' },

    // --- MARZO (Pico de registros y pagos pendientes) ---
    { iIdcandidato: 301, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Karla Panini', dFecharegistro: '2026-03-01', cPagado: '0' },
    { iIdcandidato: 302, vNomreclutador: '01006 - Almicar', vLorigen: 'TAPALPA', vNomcandidato: 'Luis Miguel', dFecharegistro: '2026-03-03', cPagado: '1' },
    { iIdcandidato: 303, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Monica Naranjo', dFecharegistro: '2026-03-05', cPagado: '0' },
    { iIdcandidato: 304, vNomreclutador: '01006 - Almicar', vLorigen: 'CD GUZMAN', vNomcandidato: 'Noel Schajris', dFecharegistro: '2026-03-07', cPagado: '1' },
    { iIdcandidato: 305, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Oscar de la Hoya', dFecharegistro: '2026-03-10', cPagado: '0' },
    { iIdcandidato: 306, vNomreclutador: '01006 - Almicar', vLorigen: 'TAPALPA', vNomcandidato: 'Patricia Navidad', dFecharegistro: '2026-03-12', cPagado: '1' },
    { iIdcandidato: 307, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Quentin Tarantino', dFecharegistro: '2026-03-14', cPagado: '0' },
    { iIdcandidato: 308, vNomreclutador: '01006 - Almicar', vLorigen: 'CD GUZMAN', vNomcandidato: 'Ramiro Delgado', dFecharegistro: '2026-03-15', cPagado: '1' },
    { iIdcandidato: 309, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Sergio Mayer', dFecharegistro: '2026-03-16', cPagado: '0' },
    { iIdcandidato: 310, vNomreclutador: '01006 - Almicar', vLorigen: 'TAPALPA', vNomcandidato: 'Thalia Sodi', dFecharegistro: '2026-03-17', cPagado: '1' },
    { iIdcandidato: 311, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Ursula Corbero', dFecharegistro: '2026-03-18', cPagado: '0' },
    { iIdcandidato: 312, vNomreclutador: '01006 - Almicar', vLorigen: 'CD GUZMAN', vNomcandidato: 'Vicente Fernandez Jr', dFecharegistro: '2026-03-19', cPagado: '1' },
    { iIdcandidato: 313, vNomreclutador: '01003 - Alfredo', vLorigen: 'SAYULA', vNomcandidato: 'Ximena Sariñana', dFecharegistro: '2026-03-20', cPagado: '0' },
];

export const ReclutadoresPage = () => {

    const dispatch = useDispatch();

    // Estados locales
    const [reclutadorSeleccionado, setReclutadorSeleccionado] = useState('');
    const [showError, setShowError] = useState(false);

    // Selectores del Store
    const { actividades = [], isLoading: isLoadingAct, errorMessage: errorAct } = useSelector((state) => state.selNomina);
    const [loadAct, setLoadAct] = useState(true);

    // const { candidatos = [], listaReclutadores = [], isLoading } = useSelector(state => state.reclutadores);
    const { listaReclutadores = [], isLoading } = useSelector(state => state.reclutadores);
    const candidatos = datosPrueba; // <--- Forzamos el uso de los datos de enero a marzo

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const agrupadoPorMes = Object.values(
        candidatos.reduce((acc, c) => {
            const fecha = new Date(c.dFecharegistro);
            const mesIndex = fecha.getMonth();
            const mesNombre = nombresMeses[mesIndex];
            // Capturamos el nombre del reclutador del primer registro que encuentre por mes
            const nombreRec = c.vNomreclutador || 'Sin nombre';

            if (!acc[mesIndex]) {
                acc[mesIndex] = {
                    orden: mesIndex,
                    mes: mesNombre,
                    pagados: 0,
                    pendientes: 0,
                    reclutador: nombreRec // <--- Guardamos el nombre aquí
                };
            }

            if (String(c.cPagado) === '1') acc[mesIndex].pagados += 1;
            else acc[mesIndex].pendientes += 1;

            return acc;
        }, {})
    ).sort((a, b) => a.orden - b.orden);

    const [lineasVisibles, setLineasVisibles] = useState({
        pagados: true,
        pendientes: true
    });

    const handleLegendClick = (e) => {
        const { dataKey } = e;
        setLineasVisibles((prev) => ({
            ...prev,
            [dataKey]: !prev[dataKey]
        }));
    };
    useEffect(() => {
        dispatch(getActividades());
        if (actividades.length > 0 || errorAct) {
            setLoadAct(false);
        }
    }, [dispatch, isLoadingAct, actividades.length, errorAct]); // Dependencias para volver a cargar si es necesario

    // Carga inicial
    useEffect(() => {
        // dispatch(startLoadingCandidatos());
        dispatch(startLoadingReclutadores());

        return () => {
            dispatch(setCandidatos([])); // Limpia la lista de candidatos en Redux
        };
    }, [dispatch]);

    // Función de búsqueda siguiendo tu estilo de Nómina
    const handleSearchRT = useCallback(() => {
        if (reclutadorSeleccionado.trim() !== '') {
            dispatch(startSearchCandidatos(reclutadorSeleccionado));
        } else {
            Swal.fire({
                title: 'Selecciona reclutador',
                text: 'Debes seleccionar un reclutador de la lista.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
        }
    }, [dispatch, reclutadorSeleccionado]);

    const onClear = () => {
        setReclutadorSeleccionado('');
        // Opción A: Si tu thunk startSearchCandidatos maneja strings vacíos para limpiar
        dispatch(setCandidatos([]));
    };

    //Manejo de candidatos seleccionados para marcar como pagados
    const [seleccionados, setSeleccionados] = useState(new Set());

    const handleMarcarPagado = async () => {
        if (seleccionados.size === 0) return;

        const ids = Array.from(seleccionados);
        const result = await dispatch(startUpdatePagoCandidatos(ids, reclutadorSeleccionado));

        if (result.ok) {
            setSeleccionados(new Set());
            Swal.fire({
                title: 'Actualizado',
                text: 'El pago se actualizó correctamente.',
                icon: 'success',
                // imageUrl: '/img/success.png',
                imageWidth: 120,
                imageHeight: 120,
                confirmButtonText: 'Aceptar'
            });
        } else {
            Swal.fire({
                title: 'No se pudo actualizar',
                text: result.error || 'Ocurrió un problema al marcar como pagado.',
                icon: 'error',
                // imageUrl: '/img/error.png',
                imageWidth: 120,
                imageHeight: 120,
                confirmButtonText: 'Cerrar'
            });
        }
    };

    const toggleSeleccion = (id) => {
        if (!id) return;
        const next = new Set(seleccionados);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSeleccionados(next);
    };

    // const pendientes = candidatos.filter(c => String(c.cPagado) !== '1');

    //fin manejo de candidatos seleccionados

    // const totalRegistros = candidatos.length;
    // const seleccionadosCount = seleccionados.size;

    const [showPagadosModal, setShowPagadosModal] = useState(false);

    const pagados = candidatos.filter(c => String(c.cPagado) === '1');
    const pendientes = candidatos.filter(c => String(c.cPagado) !== '1');

    const allSelected =
        pendientes.length > 0 &&
        pendientes.every(c => seleccionados.has(c.iIdcandidato));

    const totalRegistros = candidatos.length;
    const seleccionadosCount = seleccionados.size;

    const pagadosCount = pagados.length;
    const pendientesCount = pendientes.length;

    const agrupado = Object.values(
        candidatos.reduce((acc, c) => {
            const reclutador = c.vNomreclutador || 'Sin reclutador';
            if (!acc[reclutador]) acc[reclutador] = { reclutador, pagados: 0, pendientes: 0 };
            if (String(c.cPagado) === '1') acc[reclutador].pagados += 1;
            else acc[reclutador].pendientes += 1;
            return acc;
        }, {})
    );
    const chartData = [
        { name: 'Pagados', value: pagadosCount },
        { name: 'Pendientes', value: pendientesCount }
    ];

    const [showChart, setShowChart] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [candidatoAEditar, setCandidatoAEditar] = useState(null);

    // Función para abrir el modal cargando los datos del candidato
    const handleOpenEdit = (candidato) => {
        // Creamos una copia del objeto con los datos normalizados
        const candidatoNormalizado = {
            ...candidato,
            // Usamos trim() para quitar espacios que vienen de SQL Server
            // vCodigopersonal es el campo que usa tu Input de texto
            vCodigopersonal: candidato.cCodigoTra?.trim() || '',

            // vActividad es el campo que usa tu Select (value)
            // Asegúrate de que los nombres coincidan con los que devuelve el API (ConsultarCandidatos)
            vActividad: candidato.cCodigoAct?.trim() || ''
        };

        setCandidatoAEditar(candidatoNormalizado);
        setShowEditModal(true);
    };

    const onGuardarCambiosNomina = async (candidato) => {

        // 1. Mapeamos los campos del modal a los nombres que espera el API (.NET)
        const datosParaAPI = {
            cCodigoTra: candidato.vCodigopersonal?.trim(), // El input de texto
            cCodigoAct: candidato.vActividad?.trim()      // El valor del select
        };

        // 2. Disparamos el Thunk enviando el ID y el nuevo objeto
        // Usamos el nombre del reclutador actual para que la tabla se refresque en la misma vista
        const result = await dispatch(startSaveNominaCodes(
            candidato.iIdcandidato,
            datosParaAPI,
            reclutadorSeleccionado // El estado que usas para filtrar la tabla principal
        ));

        // 3. Opcional: Feedback al usuario
        if (result.ok) {
            console.log("Actualización exitosa");
        }
    };

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

            <br /><br />

            <div id="pagesContainer" className="container-fluid rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '25px', textAlign: 'center' }}>
                    <strong>Candidatos Registrados</strong>
                </div>

                <div className="container-fluid overflow-auto m-2" style={{ display: "flex", alignItems: "flex-end" }}>

                    <div className="mb-2 me-3" style={{ width: '400px' }}>
                        <p className="m-0 me-3 sizeLetra">Seleccionar Reclutador:</p>
                        <select className="form-select sizeLetra" value={reclutadorSeleccionado} onChange={(e) => setReclutadorSeleccionado(e.target.value)}>
                            <option value="">Selecciona Reclutador</option>
                            {
                                listaReclutadores.map((rec) => (
                                    <option key={rec.cCodigoOrg} value={`${rec.cCodigoOrg} - ${rec.vNombreOrg}`}>
                                        {`${rec.cCodigoOrg} - ${rec.vNombreOrg}`}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="mb-2 me-2">
                        <button className="btn btn-warning rounded-2 me-2" onClick={handleSearchRT} disabled={isLoading}>
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>

                    <div className="mb-2 me-2">
                        <button className="btn btn-secondary rounded-2 me-2" onClick={onClear}>
                            <i className="fas fa-filter fa-sm"></i> Limpiar
                        </button>
                    </div>
                    <button className="btn btn-success rounded-2" style={{ marginLeft: 'auto' }} onClick={handleMarcarPagado} disabled={!seleccionados.size}>Marcar pagado</button>
                    <button
                        className="btn btn-info rounded-2 ms-2"
                        onClick={() => setShowPagadosModal(true)}
                    >
                        Ver pagados
                    </button>
                </div>

                <div className="table-responsive mt-3" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover">
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSeleccionados(new Set(pendientes.map(c => c.iIdcandidato)));
                                            } else {
                                                setSeleccionados(new Set());
                                            }
                                        }}
                                    />
                                </th>
                                {/* <th scope="col">No.</th> */}
                                <th scope="col">Nombre Candidato</th>
                                <th scope="col">Origen</th>
                                <th scope="col">Fecha Registro</th>
                                <th scope="col">Estatus</th>
                                <th scope="col">Documento</th>
                                <th scope="col">Dias laborados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                candidatos.length > 0 ? (
                                    candidatos.map((c, index) => (
                                        <tr key={c.iIdcandidato || index}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionados.has(c.iIdcandidato)}
                                                    disabled={String(c.cPagado) === '1'}
                                                    onChange={() => toggleSeleccion(c.iIdcandidato)}
                                                />
                                            </td>
                                            {/* <td>{index + 1}</td> */}
                                            <td className="d-flex align-items-center">

                                                {/* Nombre normal, sin link */}
                                                <span className="fw-bold">{c.vNomcandidato}</span>

                                                {/* Botón con icono de edición */}
                                                <button className="btn btn-sm" onClick={() => handleOpenEdit(c)}
                                                    style={{ color: '#7c30b8', backgroundColor: 'transparent', border: 'none' }} title="Editar candidato">
                                                    <i className="fas fa-edit fa-lg"></i>
                                                </button>

                                            </td>
                                            <td>{c.vLorigen}</td>
                                            <td>{c.dFecharegistro ? new Date(c.dFecharegistro).toLocaleDateString() : 'N/A'}</td>
                                            <td>{c.cPagado === "1" ? "PAGADO" : "PENDIENTE"}</td>
                                            <td>
                                                <a href={`${urlServer}${c.vInedoc}`} target="_blank" rel="noreferrer" >
                                                    Ver INE
                                                </a>
                                            </td>
                                            <td> 5 </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-2">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>{isLoading ? 'Cargando...' : 'No se encontraron candidatos para este reclutador.'}</strong>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                    <hr />
                </div>
                <div className="mt-2 d-flex justify-content-between align-items-center">
                    <span className="badge" style={{ background: '#7c30b8', color: 'white' }}>
                        Registros seleccionados: {seleccionadosCount}
                    </span>
                    <small className="text-muted">
                        Total de registros visibles: <strong>{totalRegistros}</strong>
                    </small>
                </div>
            </div>

            {showEditModal && candidatoAEditar && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: '#7c30b8', fontWeight: 'bold', color: 'white' }}>
                                <h5 className="modal-title m-0">Editar Candidato</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre del Candidato</label>
                                    <input type="text" className="form-control" value={candidatoAEditar.vNomcandidato} disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Código de Trabajador</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej. 12345"
                                        // 1. Evita que el teclado permita escribir más de 5
                                        maxLength={5}
                                        value={candidatoAEditar.vCodigopersonal || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // 2. Validación: Solo números (opcional) y máximo 5 dígitos
                                            if (val.length <= 5 && /^[0-9]*$/.test(val)) {
                                                setCandidatoAEditar({
                                                    ...candidatoAEditar,
                                                    vCodigopersonal: val
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Actividad</label>
                                    <div className="mb-3">
                                        <select
                                            className="form-select"
                                            // Guardamos el código en el estado del candidato
                                            value={candidatoAEditar.vActividad || ''}
                                            onChange={(e) => setCandidatoAEditar({ ...candidatoAEditar, vActividad: e.target.value })}
                                        >
                                            <option value="">Seleccione actividad...</option>
                                            {Object.values(actividades).map((act, index) => (
                                                <option key={act.cCodigoAct.trim()} value={act.cCodigoAct.trim()}>
                                                    {`${act.cCodigoAct.trim()} - ${act.vNombreAct.trim()}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                                <button className="btn btn-primary"
                                    onClick={() => {
                                        // console.log("Datos a enviar al API:", candidatoAEditar);
                                        // Aquí llamarías a tu función de guardado
                                        onGuardarCambiosNomina(candidatoAEditar);
                                        setShowEditModal(false);
                                    }}>
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showPagadosModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between align-items-center" style={{ background: '#7c30b8', fontWeight: 'bold', color: 'white' }}>
                                {/* <h5 className="modal-title m-0">Candidatos Pagados ({pagados.length})</h5> */}
                                <h4 className="modal-title m-0">Candidatos</h4>
                                <div>
                                    <button type="button" className="btn-close" onClick={() => setShowPagadosModal(false)} />
                                </div>
                            </div>
                            <div className="modal-body">
                                {pagados.length > 0 ? (
                                    <div className="table-responsive" style={{ maxHeight: '350px' }}>
                                        <table className="table table-striped">
                                            <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Nombre</th>
                                                    <th>Origen</th>
                                                    <th>Fecha</th>
                                                    <th>Documento</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pagados.map((c, idx) => (
                                                    <tr key={c.iIdcandidato || idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>{c.vNomcandidato}</td>
                                                        <td>{c.vLorigen}</td>
                                                        <td>{c.dFecharegistro ? new Date(c.dFecharegistro).toLocaleDateString() : 'N/A'}</td>
                                                        <td>
                                                            <a href={`${urlServer}${c.vInedoc}`} target="_blank" rel="noreferrer">Ver INE</a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                    </div>
                                ) : (
                                    <p>No hay registros pagados.</p>
                                )}
                                {showChart && (
                                    <> {/* 👈 Agregamos un Fragment para agrupar todo lo que depende de showChart */}
                                        <div className="mt-4">
                                            {/* TÍTULO DINÁMICO CON EL NOMBRE DEL RECLUTADOR */}
                                            <div className="text-center mb-3">
                                                <h5 style={{ color: '#7c30b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    <i className="fas fa-user-tie me-2"></i>
                                                    Reporte: {
                                                        reclutadorSeleccionado
                                                            ? reclutadorSeleccionado
                                                            : (candidatos.length > 0 ? candidatos[0].vNomreclutador : "General")
                                                    }
                                                </h5>
                                                <hr style={{ width: '50%', margin: '10px auto', opacity: '0.2' }} />
                                            </div>
                                            <ResponsiveContainer width="100%" height={320}>
                                                <LineChart data={agrupadoPorMes} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="mes" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />

                                                    {/* AGREGAR onClick aquí */}
                                                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', userSelect: 'none' }} />

                                                    {/* Línea de Pagados con propiedad hide dinámica */}
                                                    <Line type="monotone" dataKey="pagados" name="Pagados" stroke="#28a745" strokeWidth={3} dot={{ r: 5 }} hide={!lineasVisibles.pagados} />

                                                    {/* Línea de Pendientes con propiedad hide dinámica */}
                                                    <Line type="monotone" dataKey="pendientes" name="Pendientes" stroke="#ffc107" strokeWidth={3} dot={{ r: 5 }} hide={!lineasVisibles.pendientes} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <span className="badge bg-success">Pagados: {pagadosCount}</span>
                                        <span className="badge bg-warning ms-2">Pendientes: {pendientesCount}</span>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                {/* Este botón se irá a la izquierda automáticamente */}
                                <button className={`btn btn-sm ${showChart ? 'btn-secondary' : 'btn-secondary'}`} onClick={() => setShowChart(!showChart)}>
                                    <i className={`fas ${showChart ? 'fa-table' : 'fa-chart-line'} me-1`}></i>
                                    {showChart ? 'Ver Tabla de Datos' : 'Ver Gráfico Comparativo'}
                                </button>

                                {/* Este botón se irá a la derecha */}
                                <button className="btn btn-sm btn-danger" onClick={() => setShowPagadosModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}