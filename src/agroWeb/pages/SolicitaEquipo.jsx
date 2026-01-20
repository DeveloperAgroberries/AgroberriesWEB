import { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from '../../hooks';
import { Modal, Button, OverlayTrigger, Tooltip, FormControl, Form, InputGroup, Row, Col, Alert, Nav, Table } from 'react-bootstrap';
import { iniciarSolicitud, getSolicitudes, marcarSolicitudTerminada } from "../../store/slices/activosFijos/thunks";
import Swal from 'sweetalert2'; // 💡 Importar SweetAlert2
import { AuthContext } from '../../auth/context/AuthContext';

export const SolicitaEquipo = () => {

    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);
    const [showSolicitudes, setShowSolicitudes] = useState(false);
    const [showSolicitudesTerminadas, setShowSolicitudesTerminadas] = useState(false);
    const { solicitudes = [], isLoading, errorMessage } = useSelector((state) => state.activosFijos);
    // Filtramos las solicitudes para solo mostrar las pendientes
    const solicitudesPendientes = solicitudes.filter(solicitud =>
        solicitud.vEstadosolicitud && solicitud.vEstadosolicitud.toUpperCase() === 'PENDIENTE'
    );
    const solicitudesTerminadas = solicitudes.filter(solicitud =>
        solicitud.vEstadosolicitud && solicitud.vEstadosolicitud.toUpperCase() === 'TERMINADO'
    );

    const [showDetalleModal, setShowDetalleModal] = useState(false); // Para mostrar/ocultar el modal de detalle
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null); // Para guardar los datos a mostrar

    const openSolicitudes = () => { // Recibe el objeto chofer como argumento
        dispatch(getSolicitudes()); // Carga los datos frescos antes de abrir el modal
        setShowSolicitudes(true);         // Abre el modal de edición
    }
    const closeSolcitudes = () => {
        setShowSolicitudes(false);
    };

    const openSolicitudesTerminadas = () => { // Recibe el objeto chofer como argumento
        dispatch(getSolicitudes()); // Carga los datos frescos antes de abrir el modal
        setShowSolicitudesTerminadas(true);         // Abre el modal de edición
    }
    const closeSolcitudesTerminadas = () => {
        setShowSolicitudesTerminadas(false);
    };

    const initialState = {
        //DATOS SOLICITUD
        vNomsolicitante: '',
        vPuestosoli: '',
        vEmail: '',
        vJustificacion: '',
        //DATOS NUEVO USUARIO
        vCodtrabajador: '',
        vNomusuario: '',
        vDepartamento: '',
        vPuestousuario: '',
        vNomjefe: '',
        vRancho: '',
        //vHerramientas Y SISTEMAS
        vHerramientas: [],
        vErp: '',
        vWeb: [],
        vMovil: [],
        vComentarios: ''
    };

    const [formData, setFormData] = useState(initialState);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prevData => ({
            ...prevData,
            //[name]: type === 'checkbox' ? 1 : 0,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
            //cResponsivaAti: activoEncontrado.cResponsivaAti === '1' ? 1 : 0 // Convierte el string '1' a número 1 y el resto a 0

        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        //setIsLoadingGuardado(true);

        // 💡 PASO CLAVE: Detener el envío si la validación falla
        if (!isFormValid()) {
            return;
        }

        const dataToSend = {
            ...formData,
            vHerramientas: formData.vHerramientas.join(', '),
            vWeb: formData.vWeb.join(', '),
            vMovil: formData.vMovil.join(', ')
        };

        const success = await dispatch(iniciarSolicitud(dataToSend));

        // 3. Manejar la respuesta (ej. mostrar un mensaje o limpiar el formulario)
        if (success) {
            //alert('¡Solicitud enviada con éxito!');
            // ✅ ÉXITO: Muestra un SweetAlert de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Solicitud Enviada!',
                text: 'Tu solicitud de equipo ha sido registrada y está pendiente de revisión.',
                confirmButtonText: 'Aceptar'
            });
            setFormData(initialState);
        } else {
            // ❌ FALLO: Muestra un SweetAlert de error usando el mensaje de Redux
            Swal.fire({
                icon: 'error',
                title: 'Error de Envío',
                // Usamos el mensaje de error que capturó Redux
                text: 'Ocurrió un error inesperado al registrar la solicitud. Intenta nuevamente.',
                confirmButtonText: 'Aceptar'
            });
        }

    };

    const [errors, setErrors] = useState({});
    const isFormValid = () => {
        // 1. Validar campos de texto vacíos (null o '')
        let currentErrors = {}; // Objeto para acumular errores visuales
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const requiredTextFields = [
            'vNomsolicitante', 'vPuestosoli', 'vEmail', 'vJustificacion',
            'vCodtrabajador', 'vNomusuario', 'vDepartamento', 'vPuestousuario',
            'vNomjefe', 'vRancho'
        ];

        // --- PASO 1: VALIDAR CAMPOS VACÍOS EN TODO EL FORMULARIO ---
        let hasEmptyField = false;

        for (const field of requiredTextFields) {
            const fieldValue = String(formData[field] || '').trim();

            if (fieldValue === '') {
                currentErrors[field] = 'Campo requerido.';
                hasEmptyField = true;
            }
        }

        // 🚩 ACTUALIZAR EL ESTADO DE ERRORES VISUALES
        // Esto asegura que los campos vacíos se pinten en rojo inmediatamente.
        setErrors(currentErrors);

        if (hasEmptyField) {
            // Si encontramos cualquier campo vacío, mostramos la alerta genérica y salimos.
            Swal.fire({
                icon: 'warning',
                title: 'Campos Requeridos',
                text: 'Los campos marcados con * no pueden quedar vacíos. Por favor, corrígelos.',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        // --- PASO 2: VALIDAR FORMATO DE CORREO (SOLO SI NO HAY VACÍOS) ---
        const emailValue = String(formData.vEmail || '').trim();

        if (!emailRegex.test(emailValue)) {
            // En este punto, sabemos que no hay campos vacíos, solo un error de formato en vEmail.
            currentErrors.vEmail = 'Formato de correo inválido.'; // Asignar el error específico

            // 🚩 Actualizar el estado para pintar SÓLO el campo de correo en rojo.
            setErrors({ ...currentErrors, vEmail: 'Formato de correo inválido.' });

            Swal.fire({
                icon: 'error',
                title: 'Formato Inválido',
                text: 'Formato de correo inválido. Ejemplo: tu_usuario@agroberries.mx',
                confirmButtonText: 'Aceptar'
            });
            return false;
        }

        // 2. Validar que al menos un checkbox de las listas esté seleccionado (arrays no vacíos)
        const requiredArrays = [
            { name: 'vHerramientas', label: 'Herramientas Solicitadas' },
            // { name: 'vWeb', label: 'Acceso a portal vWeb' },
            // { name: 'vMovil', label: 'Aplicaciones vMoviles' }
        ];

        for (const arr of requiredArrays) {
            if (!formData[arr.name] || formData[arr.name].length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Selección Requerida',
                    text: 'Minimo una opción debe ser seleccionada en "' + arr.label + '".',
                    confirmButtonText: 'Aceptar'
                });
                return false;
            }
        }

        // Si todas las validaciones pasan
        return true;
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;

        setFormData(prevData => {
            const currentArray = prevData[name]; // Obtiene el array actual (vHerramientas, vWeb, o vMovil)

            if (checked) {
                // 1. Si está marcado, añade el valor al array.
                return {
                    ...prevData,
                    [name]: [...currentArray, value]
                };
            } else {
                // 2. Si está desmarcado, filtra el array para quitar el valor.
                return {
                    ...prevData,
                    [name]: currentArray.filter(item => item !== value)
                };
            }
        });
    };

    // FUNCIÓN PARA LA ACCIÓN DE REVISIÓN (PLACEHOLDER)
    const handleRevisar = (solicitudId) => {
        // 1. Busca la solicitud completa en la lista de solicitudes
        const solicitud = solicitudes.find(s => s.iIdsolicitud === solicitudId);

        if (solicitud) {
            // 2. Guarda los datos de la solicitud
            setSolicitudSeleccionada(solicitud);
            // 3. Abre el nuevo modal de detalle
            setShowDetalleModal(true);
        }
    };

    // Función auxiliar para formatear la fecha a YYYY-MM-DD
    const formatDateString = (dateString) => {
        if (!dateString) return '';

        // Crea un objeto de fecha
        const date = new Date(dateString);

        // Obtiene los componentes de la fecha
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        //const monthName = date.toLocaleString('es-MX', { month: 'long' }); // 'long' para el nombre completo
        const day = String(date.getDate()).padStart(2, '0');

        // Regresa la fecha en formato YYYY-MM-DD
        return `${day}-${month}-${year}`;
    };

    // 👇 NUEVA FUNCIÓN PARA CERRAR EL MODAL DE DETALLE 👇
    const closeDetalleModal = () => {
        setShowDetalleModal(false);
        setSolicitudSeleccionada(null); // Limpia los datos al cerrar
    };

    const handleTerminado = async () => {
        if (!solicitudSeleccionada) {
            Swal.fire('Error', 'No se pudo encontrar la solicitud seleccionada.', 'error');
            return;
        }

        const { iIdsolicitud } = solicitudSeleccionada;

        // 1. Confirmación de usuario antes de actualizar
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas marcar la Solicitud #${iIdsolicitud} como TERMINADA?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745', // verde
            cancelButtonColor: '#6c757d',  // gris
            confirmButtonText: 'Sí, ¡Terminar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            // 2. Dispara el Thunk de actualización (asumiendo que actualizará vEstadosolicitud a 'TERMINADO')
            // El Thunk debe devolver 'true' en caso de éxito.
            const success = await dispatch(marcarSolicitudTerminada(iIdsolicitud, 'TERMINADO'));

            if (success) {
                Swal.fire(
                    '¡Actualizada!',
                    `La Solicitud #${iIdsolicitud} ha sido marcada como TERMINADA.`,
                    'success'
                );

                // 3. Cierra el modal de detalle y actualiza la lista principal
                closeDetalleModal();
                dispatch(getSolicitudes()); // Refresca la lista para eliminar la solicitud de Pendientes

            } else {
                Swal.fire('Error', 'Hubo un error al intentar actualizar el estado de la solicitud.', 'error');
            }
        }
    };

    const calcularDiasTranscurridos = (dateString) => {
        if (!dateString) return 0;

        // 1. Obtener la fecha de creación y la fecha de hoy
        const fechaCreacion = new Date(dateString);
        const hoy = new Date();

        // Opcional: Establecer la hora a medianoche para evitar que el cálculo se vea afectado por la hora del día
        fechaCreacion.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        // 2. Calcular la diferencia en milisegundos
        const diferenciaMs = hoy.getTime() - fechaCreacion.getTime();

        // 3. Convertir milisegundos a días
        // 1 día = 1000 ms * 60 segundos * 60 minutos * 24 horas
        const msPorDia = 1000 * 60 * 60 * 24;

        // Redondear hacia abajo para obtener días completos transcurridos
        return Math.floor(diferenciaMs / msPorDia);
    };

    useEffect(() => {
        // Al entrar: Forzamos el scroll y quitamos bloqueos
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        document.body.classList.remove('modal-open');

        return () => {
            // Al salir (limpieza): Devolvemos el control al CSS global
            document.body.style.overflowY = '';
            document.body.style.height = '';
        };
    }, []);

    // Este segundo efecto limpia el body cada vez que cierras un modal
    useEffect(() => {
        if (!showSolicitudes && !showSolicitudesTerminadas && !showDetalleModal) {
            document.body.classList.remove('modal-open');
            document.body.style.overflowY = 'auto';
        }
    }, [showSolicitudes, showSolicitudesTerminadas, showDetalleModal]);

    return (
        <>
            <style type="text/css">
                {`
                    /*
                    ESTADO NORMAL: Estilos por defecto
                    */
                    .btn-enviar {
                        /* Color de Texto (Lo que antes era color: 'white') */
                        color: white; 
                        
                        /* Color de Fondo (Lo que antes era backgroundColor: '#000000ff') */
                        background-color: #000000; 
                        
                        /* Borde (Lo que antes era borderColor: '#ccc') */
                        border-color: #ccc; 
                        
                        /* Transición suave: Hace que el cambio de color no sea instantáneo */
                        transition: background-color 0.3s ease, color 0.3s ease; 
                    }

                    /*
                    ESTADO HOVER: Estilos al pasar el ratón
                    */
                    .btn-enviar:hover {
                        /* Ejemplo: Fondo gris claro */
                        background-color: #828282ff; 
                        
                        /* Ejemplo: El texto puede seguir siendo blanco, o cambiar a un color si quieres */
                        color: white; 
                        
                        /* Ejemplo: Un borde un poco más oscuro */
                        border-color: #999; 
                        
                        /* Si tienes dudas sobre la especificidad, puedes usar !important, pero es mejor evitarlo */
                    }

                    .badge-multiline {
                        /* 1. Fuerza al texto a envolverse */
                        white-space: normal !important; 
                        /* 2. Permite que el elemento ocupe todo el ancho disponible */
                        display: block !important; 
                        /* 3. Ajusta el alineamiento (opcional, pero mejora la lectura) */
                        text-align: left;
                        /* 4. Evita que el badge se extienda más allá del ancho de la columna */
                        word-wrap: break-word; /* Solución para cadenas de texto muy largas sin espacios */
                        overflow-wrap: break-word;
                    }

                    /* 2. Estilo para que el campo de comentarios no desborde el modal */
                    .scroll-box {
                        max-height: 150px; /* Define una altura máxima para que el contenedor no crezca indefinidamente */
                        overflow-y: auto;  /* Agrega una barra de desplazamiento si el contenido excede el max-height */
                    }

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

            <div id="pagesContainer" className="container-fluid rounded-3 p-3 mt-5 animate__animated animate__fadeIn" style={{
                marginTop: '20px',
                marginBottom: '40px',
                alignSelf: 'flex-start', // Evita que se centre verticalmente si es muy largo
                height: 'auto'
            }}>
                <div className="rounded-3" id='encabezadosPagina'>
                    <strong>Solicitud de equipo de computo</strong>
                </div>

                <div className="d-flex justify-content-end align-items-center mt-3" style={{ marginBottom: '1%' }}>
                    {/* 1. Elemento de la Izquierda: El texto */}
                    <p className="m-0 me-auto">Llenado de solicitud de equipo de computo.</p>

                    {/* 2. Contenedor de la Derecha: Agrupa los botones */}
                    {user?.id === "AOROZCO" || user?.id === "RDIMAS" || user?.id === "AUXSISTEMAS" ? (
                        <div className="d-flex gap-2"> {/* Usamos d-flex y gap-2 para espaciar los botones */}

                            <Button variant="success" onClick={() => openSolicitudesTerminadas()}>
                                <i className="fas fa-check fa-lg" style={{ marginRight: '5px' }}></i>
                                Solicitudes terminadas
                            </Button>

                            <Button variant="warning" onClick={() => openSolicitudes()}>
                                <i className="fas fa-history fa-lg" style={{ marginRight: '5px' }}></i>
                                Solicitudes pendientes
                            </Button>

                        </div>
                    ) : null}
                </div>

                <Form onSubmit={handleSubmit} style={{ fontSize: '0.8rem' }}>

                    {/* ////////////////////////////////////////////////////////////////////////////// */}
                    <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                        Datos de la solicitud
                    </label>
                    <div className="p-3 border rounded shadow-sm mb-4 bg-light">
                        <Row className="mb-3">
                            <Col md={3}>
                                <Form.Group controlId="vNomsolicitante">
                                    <Form.Label>Nombre del solicitante *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNomsolicitante" value={formData.vNomsolicitante || ''} isInvalid={!!errors.vNomsolicitante} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vPuestosoli">
                                    <Form.Label>Puesto del solicitante *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPuestosoli" value={formData.vPuestosoli || ''} isInvalid={!!errors.vPuestosoli} onChange={handleInputChange} disabled={false} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="vEmail">
                                    <Form.Label>Correo electrónico del solicitante *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vEmail" value={formData.vEmail || ''} onChange={handleInputChange} isInvalid={!!errors.vEmail} placeholder="tu_usuario@agroberries.mx" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="vJustificacion">
                                    <Form.Label>Justificación de la asignacion *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} as="textarea" rows={3} name="vJustificacion" value={formData.vJustificacion || ''} isInvalid={!!errors.vJustificacion} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>


                    {/* ////////////////////////////////////////////////////////////////////////////// */}
                    <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                        Datos del nuevo usuario
                    </label>
                    <div className="p-3 border rounded shadow-sm mb-4 bg-light">
                        <Row className="mb-3">
                            <Col md={2}>
                                <Form.Group controlId="vCodtrabajador">
                                    <Form.Label>Código del trabajador *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vCodtrabajador" value={formData.vCodtrabajador || ''} isInvalid={!!errors.vCodtrabajador} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vNomusuario">
                                    <Form.Label>Nombre completo *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNomusuario" value={formData.vNomusuario || ''} isInvalid={!!errors.vNomusuario} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vDepartamento">
                                    <Form.Label>Departamento *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vDepartamento" value={formData.vDepartamento || ''} isInvalid={!!errors.vDepartamento} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vPuestousuario">
                                    <Form.Label>Puesto *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPuestousuario" value={formData.vPuestousuario || ''} isInvalid={!!errors.vPuestousuario} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vNomjefe">
                                    <Form.Label>Nombre del jefe directo *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNomjefe" value={formData.vNomjefe || ''} isInvalid={!!errors.vNomjefe} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vRancho">
                                    <Form.Label>Rancho / lugar de trabajo *</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vRancho" value={formData.vRancho || ''} isInvalid={!!errors.vRancho} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                        Herrmientas y sistemas requeridos
                    </label>
                    <div className="p-3 border rounded shadow-sm mb-4 bg-light">
                        <Row className="mb-3">
                            <Col md={2}>
                                <Form.Group controlId="vHerramientas">
                                    <Form.Label>Herrmientas Solicitadas</Form.Label>
                                    {['checkbox'].map((type) => (
                                        <div key={`default-${type}`} className="mb-3">
                                            <Form.Check type="checkbox" name="vHerramientas" value="Laptop" label="Laptop" onChange={handleCheckboxChange} checked={formData.vHerramientas.includes('Laptop')} />
                                            <Form.Check type="checkbox" name="vHerramientas" value="PC" label="Computadora de escritorio (PC)" onChange={handleCheckboxChange} checked={formData.vHerramientas.includes('PC')} />
                                            <Form.Check type="checkbox" name="vHerramientas" value="Mouse" label="Mouse" onChange={handleCheckboxChange} checked={formData.vHerramientas.includes('Mouse')} />
                                            <Form.Check type="checkbox" name="vHerramientas" value="Mochila" label="Mochila" onChange={handleCheckboxChange} checked={formData.vHerramientas.includes('Mochila')} />
                                            <Form.Check type="checkbox" name="vHerramientas" value="Otras" label="Otras" onChange={handleCheckboxChange} checked={formData.vHerramientas.includes('Otras')} />
                                        </div>
                                    ))}
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="vErp">
                                    <Form.Label>ERP Eclipse (Indica los modulos / opciones autorizadas)</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vErp" value={formData.vErp || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vWeb">
                                    <Form.Label>Acceso a portal Web</Form.Label>
                                    {['checkbox'].map((type) => (
                                        <div key={`default-${type}`} className="mb-3">
                                            <Form.Check type="checkbox" name="vWeb" value="Portal proveedores" label="Portal proveedores" onChange={handleCheckboxChange} checked={formData.vWeb.includes('Portal proveedores')} />
                                            <Form.Check type="checkbox" name="vWeb" value="Portal Agritracer" label="Portal Agritracer" onChange={handleCheckboxChange} checked={formData.vWeb.includes('Portal Agritracer')} />
                                            <Form.Check type="checkbox" name="vWeb" value="Portal Agroberries" label="Portal Agroberries (interno)" onChange={handleCheckboxChange} checked={formData.vWeb.includes('Portal Agroberries')} />
                                        </div>
                                    ))}
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group controlId="vMovil">
                                    <Form.Label>Aplicaciones Moviles</Form.Label>
                                    {['checkbox'].map((type) => (
                                        <div key={`default-${type}`} className="mb-3">
                                            <Form.Check type="checkbox" name="vMovil" value="Agritracer" label="Agritracer" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Agritracer')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Acceso vehicular" label="Acceso vehicular" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Acceso vehicular')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Control de combustibles" label="Control de combustibles" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Control de combustibles')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Transporte de personal" label="Transporte de personal" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Transporte de personal')} />
                                            <Form.Check type="checkbox" name="vMovil" value="AgroKiosko" label="AgroKiosko" onChange={handleCheckboxChange} checked={formData.vMovil.includes('AgroKiosko')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Reclutadores" label="Reclutadores (próximamente)" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Reclutadores')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Acvtivos Fijos" label="Activos Fijos (próximamente)" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Acvtivos Fijos')} />
                                            <Form.Check type="checkbox" name="vMovil" value="Otras" label="Otras" onChange={handleCheckboxChange} checked={formData.vMovil.includes('Otras')} />
                                        </div>
                                    ))}
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="vComentarios">
                                    <Form.Label>Comentarios</Form.Label>
                                    <Form.Control style={{ fontSize: '0.7rem' }} as="textarea" rows={3} name="vComentarios" value={formData.vComentarios || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                        Acceso a sistemas
                    </label> */}
                    {/* <Row className="mb-3">
                        
                    </Row> */}

                    {/* <hr></hr> */}
                    <Button type="submit" className="btn-enviar">
                        <i className="fas fa-paper-plane fa-lg" style={{ marginRight: '5px' }}></i>
                        Enviar solicitud
                    </Button>
                </Form>

                {/* Modal solicitudes pendientes */}
                <Modal show={showSolicitudes} onHide={closeSolcitudes} size="xl" centered>
                    <Modal.Header style={{ background: '#7c30b8' }} closeButton>
                        <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>
                            📋 Solicitudes de Equipo Pendientes ({solicitudesPendientes.length})
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Indicador de carga y error */}
                        {isLoading && <div className="text-center my-3"><i className="fas fa-spinner fa-spin fa-2x"></i> <p>Cargando solicitudes...</p></div>}
                        {errorMessage && <Alert variant="danger">Error al cargar: {errorMessage}</Alert>}

                        {!isLoading && solicitudesPendientes.length > 0 ? (
                            <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '12px' }}>
                                {/* 💡 CAMBIOS: Quitamos 'bordered' y mantenemos 'hover' y 'striped' */}
                                <table className="table table-striped table-hover">{/* Puedes añadir tus propias clases CSS */}
                                    <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                                        <tr>
                                            <th>No.</th>
                                            <th>Solicitante</th>
                                            <th>Nuevo Usuario</th>
                                            <th>Puesto</th>
                                            <th>Fecha Solicitud</th>
                                            <th>Días</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudesPendientes.map((solicitud) => (
                                            <tr key={solicitud.iIdsolicitud}>
                                                <td>{solicitud.iIdsolicitud}</td>
                                                <td>{solicitud.vNomsolicitante}</td>
                                                <td>{solicitud.vNomusuario}</td>
                                                <td>{solicitud.vPuestousuario}</td>
                                                <td>{formatDateString(solicitud.dFechacreacion)}</td>
                                                <td>{calcularDiasTranscurridos(solicitud.dFechacreacion)}</td>
                                                <td style={{ fontSize: '14px' }}><span className={`badge ${solicitud.vEstadosolicitud.toUpperCase() === 'PENDIENTE' ? 'bg-warning text-black' : 'bg-warning'}`}>{solicitud.vEstadosolicitud}</span></td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <OverlayTrigger key={solicitud.iIdsolicitud} placement="right" trigger={['hover', 'focus']} overlay={
                                                        <Tooltip id={`tooltip-revisar-${solicitud.iIdsolicitud}`}> Revisar Solicitud</Tooltip>}>
                                                        <Button variant="info" size="sm" onClick={() => handleRevisar(solicitud.iIdsolicitud)}><i className="fas fa-eye"></i></Button>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            !isLoading && <Alert variant="success" className="text-center">🎉 No hay solicitudes de equipo pendientes de revisión.</Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeSolcitudes}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal solicitudes terminadas */}
                <Modal show={showSolicitudesTerminadas} onHide={closeSolcitudesTerminadas} size="xl" centered>
                    <Modal.Header style={{ background: '#7c30b8' }} closeButton>
                        <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>
                            📋 Solicitudes de Equipo Terminadas ({solicitudesTerminadas.length})
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Indicador de carga y error */}
                        {isLoading && <div className="text-center my-3"><i className="fas fa-spinner fa-spin fa-2x"></i> <p>Cargando solicitudes...</p></div>}
                        {errorMessage && <Alert variant="danger">Error al cargar: {errorMessage}</Alert>}

                        {!isLoading && solicitudesTerminadas.length > 0 ? (
                            <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '12px' }}>
                                <table className="table table-striped table-hover">{/* Puedes añadir tus propias clases CSS */}
                                    <thead style={{ position: 'sticky', top: '0', zIndex: '1', backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th>No.</th>
                                            <th>Solicitante</th>
                                            <th>Nuevo Usuario</th>
                                            <th>Puesto</th>
                                            <th>Fecha Solicitud</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudesTerminadas.map((solicitud) => (
                                            <tr key={solicitud.iIdsolicitud}>
                                                <td>{solicitud.iIdsolicitud}</td>
                                                <td>{solicitud.vNomsolicitante}</td>
                                                <td>{solicitud.vNomusuario}</td>
                                                <td>{solicitud.vPuestousuario}</td>
                                                {/* 💡 Nota: Asegúrate de que este campo de fecha esté en el formato que necesitas */}
                                                <td>{formatDateString(solicitud.dFechacreacion)}</td>
                                                <td style={{ fontSize: '14px' }}>
                                                    <span className={`badge ${solicitud.vEstadosolicitud.toUpperCase() === 'TERMINADO' ? 'bg-success text-white' : 'bg-success'}`}>
                                                        {solicitud.vEstadosolicitud}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <OverlayTrigger key={solicitud.iIdsolicitud} placement="right" trigger={['hover', 'focus']} overlay={
                                                        <Tooltip id={`tooltip-revisar-${solicitud.iIdsolicitud}`}> Revisar Solicitud</Tooltip>}>
                                                        <Button variant="info" size="sm" onClick={() => handleRevisar(solicitud.iIdsolicitud)}><i className="fas fa-eye"></i></Button>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            !isLoading && <Alert variant="success" className="text-center">🎉 No hay solicitudes de equipo terminadas.</Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeSolcitudesTerminadas}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* 👇 MODAL DE DETALLE DE SOLICITUD 👇 */}
                <Modal show={showDetalleModal} onHide={closeDetalleModal} size="xl" centered>
                    <Modal.Header style={{ background: '#7c30b8' }} closeButton>
                        <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>
                            🔍 Detalle de Solicitud #{solicitudSeleccionada?.iIdsolicitud || ''}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {solicitudSeleccionada ? (
                            <div className="container-fluid">
                                <h5 className="mb-3" style={{ color: '#C6168D' }}>Información General</h5>
                                <hr />
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <strong>Solicitante:</strong> {solicitudSeleccionada.vNomsolicitante}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Puesto Solicitante:</strong> {solicitudSeleccionada.vPuestosoli}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Email del solicitante:</strong> {solicitudSeleccionada.vEmail}
                                    </div>
                                    <div className="col-12 mb-2">
                                        <strong>Justificación:</strong> <p className="text-muted border p-2 rounded">{solicitudSeleccionada.vJustificacion || 'Sin justificación'}</p>
                                    </div>
                                </div>

                                <h5 className="mt-4 mb-3" style={{ color: '#C6168D' }}>Detalle del Nuevo Usuario y Equipo</h5>
                                <hr />
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <strong>Nombre / Codigo trabajador :</strong> {solicitudSeleccionada.vNomusuario} ({solicitudSeleccionada.vCodtrabajador})
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Departamento:</strong> {solicitudSeleccionada.vDepartamento}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Puesto:</strong> {solicitudSeleccionada.vPuestousuario}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Jefe Directo:</strong> {solicitudSeleccionada.vNomjefe}
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Rancho / Lugar de trabajo:</strong> {solicitudSeleccionada.vRancho}
                                    </div>
                                </div>

                                <h5 className="mt-4 mb-3" style={{ color: '#C6168D' }}>Requerimientos de Sistemas</h5>
                                <hr />
                                <div className="row">
                                    <div className="col-md-4 mb-2">
                                        <strong>ERP:</strong>
                                        <span className="badge bg-secondary badge-multiline">{solicitudSeleccionada.vErp || 'N/A'?.split(', ').join(' | ') || 'Ninguna'}</span>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Herramientas:</strong>
                                        <span className="badge bg-secondary badge-multiline">{solicitudSeleccionada.vHerramientas?.split(', ').join(' | ') || 'Ninguna'}</span>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Web/Portales:</strong>
                                        <span className="badge bg-secondary badge-multiline">{solicitudSeleccionada.vWeb?.split(', ').join(' | ') || 'Ninguno'}</span>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <strong>Móviles:</strong>
                                        <span className="badge bg-secondary badge-multiline">{solicitudSeleccionada.vMovil?.split(', ').join(' | ') || 'Ninguna'}</span>
                                    </div>
                                    <div className="col-12 mb-2 mt-2">
                                        <strong>Comentarios:</strong>
                                        {/* Usamos un div con una clase de scroll y alto máximo */}
                                        <div className="text-muted border p-2 rounded scroll-box">
                                            {solicitudSeleccionada.vComentarios || 'Sin comentarios'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center">Cargando detalles...</p>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeDetalleModal}>
                            Cerrar
                        </Button>
                        {/* 💡 CORRECCIÓN: Usamos ?. y nos aseguramos de que el objeto exista */}
                        {solicitudSeleccionada && solicitudSeleccionada.vEstadosolicitud?.toUpperCase() !== 'TERMINADO' && (
                            <Button variant="success" onClick={handleTerminado}>Terminado</Button>
                        )}
                    </Modal.Footer>
                </Modal>
                {/* 👆 FIN MODAL DE DETALLE DE SOLICITUD 👆 */}
            </div>
        </>
    )
}
