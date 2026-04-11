import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from '../../auth/context/AuthContext';
import { ActivosList } from "../components/Combustibles/ActivosList";
import { AddActivo } from "../components/Combustibles/AddActivo";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import leaf_loader_slow from '../../../assets/leaf_loader_slow.gif';
import { getActivos, setActivos, getCamposActivos, startUpdateActivo, modificarExtras, uploadPDF, uploadResponsiva, getEmpleados, startHistoricoExtrasTI } from "../../store/slices/combustibles";
import { Modal, Button, OverlayTrigger, Tooltip, FormControl, Form, InputGroup, Row, Col, Alert, Nav } from 'react-bootstrap';
import { set } from "date-fns";
import { useForm } from '../../hooks';
import dayjs from 'dayjs';
import generarResponsivaPDF from "../../auth/helpers/generarPDF";
import generarInvPDF from "../../auth/helpers/generarInvPDF";
import { DownloadTableExcel } from "react-export-table-to-excel";
import Swal from 'sweetalert2'; // 💡 Importar SweetAlert2


export const ActivosPage = () => {
    const dispatch = useDispatch();
    const tableRef = useRef(null);
    const { subfamilias } = useSelector((state) => state.combustibles);

    // 1. NUEVO ESTADO PARA FILTRAR POR FAMILIA
    const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");

    // 2. PASAR LA FAMILIA A LA FUNCIÓN (esto disparará el useEffect interno de ActivosList)
    const { data: activosData, isLoading, errorMessage } = ActivosList(familiaSeleccionada);

    const campos = useSelector(state => state.combustibles.activosCampos);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para controlar la visibilidad
    const baseURL = import.meta.env.VITE_API_URL;
    const headerRef = useRef(null); // Referencia para el encabezado de la columna
    const opeHeaderRef = useRef(null); // Referencia para el encabezado de la columna
    const tooltipDRef = useRef(null); // para "D"
    const tooltipORef = useRef(null); // para "O"
    let tooltipInstance = null;
    const [isLoadingGuardado, setIsLoadingGuardado] = useState(false);

    useEffect(() => {
        // 1. SOLO dispara la petición si hay una familia seleccionada
        if (familiaSeleccionada !== "") {
            dispatch(getActivos(familiaSeleccionada));
        } else {
            // Si no hay familia, nos aseguramos de que el estado esté vacío
            dispatch(setActivos({ activos: [] }));
        }

        // 2. Al salir de la pantalla (limpieza)
        return () => {
            dispatch(setActivos({ activos: [] }));
        };
    }, [dispatch, familiaSeleccionada]);

    // 3. ACTUALIZAR RECORDS CUANDO CAMBIAN LOS DATOS
    useEffect(() => {
        if (activosData && activosData.length > 0) {
            setRecords(activosData);
        }
    }, [activosData]);

    useEffect(() => {
        dispatch(getCamposActivos());
        dispatch(getEmpleados());
    }, [dispatch]);

    //FUNCION PARA LLENAR EMPLEADOS
    const [searchEmpleado, setSearchEmpleado] = useState('');
    const [mostrarListaEmpleados, setMostrarListaEmpleados] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [isLoadingEmpleados, setIsLoadingEmpleados] = useState(false);
    const searchResultsEmpleados = useSelector(state => state.combustibles.empleados);

    const [responsableActual, setResponsableActual] = useState(''); // Ref para almacenar el responsable actual
    const [historico, sethistorico] = useState('');
    useEffect(() => {
        // console.log('*** responsableActual AHORA es:', responsableActual);
    }, [responsableActual, historico]);

    const handleSearchEmpleadoChange = (event) => {
        const searchText = event.target.value;
        setSearchEmpleado(searchText);
        setMostrarListaEmpleados(searchText.length > 0); // Modificado para mostrar si hay cualquier texto

        // Opcional: limpiar los estados si el input de búsqueda se vacía
        if (searchText === '') {
            setFormDataExtras(prevData => ({
                ...prevData,
                cResponsableAti: '',
            }));
        }
    };

    const handleSelectEmpleado = (empleado) => {
        // 1. Ocultar la lista de resultados
        setMostrarListaEmpleados(false);

        setFormDataExtras(prevData => ({
            ...prevData,
            cResponsableAti: empleado.cCodigoUsu,
        }));
        // 3. Actualizar el estado del input de búsqueda con el nombre seleccionado
        //    Esto hace que el nombre del empleado aparezca en el campo de texto
        setSearchEmpleado(empleado.vNombreUsu);
        setMostrarListaEmpleados(false);
    };
    // TERMINA FUNCION PARA LLENAR EMPLEADOS

    const openActivoPopup = () => {
        setIsPopupOpen(true); // Función para mostrar el modal
    };

    const closeActivoPopup = () => {
        setIsPopupOpen(false);

        // ✅ Solo refrescamos si el usuario ya estaba viendo una familia específica
        // o si ya había realizado una búsqueda previa.
        if (familiaSeleccionada !== "" || busqueda !== "") {
            setTimeout(() => {
                dispatch(getActivos(familiaSeleccionada));
            }, 300);
        } else {
            // Si no hay familia ni búsqueda, simplemente no hacemos nada 
            // o limpiamos la tabla para que siga vacía.
            // console.log("No se refresca porque no hay filtros activos.");
        }
    };

    //MODAL PARA EXTRAS TI
    const { user } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);

    const openModalExtrasTI = () => {
        setShowModal(true);
        closeEditModal(); // Cierra el modal de edición si está abierto
    }
    const closeModal = () => {
        setShowModal(false);
        setActiveKey('general');
    };

    const [obtenerNumecon, setObtenerNumecon] = useState('');
    const handleEstatusChange = (nuevoEstatus, codigoNuevo) => {
        handleEstatusChangeModal(nuevoEstatus);
        setObtenerNumecon(codigoNuevo);
        //console.log('codigoNuevo cambiado a:', codigoNuevo);
    };
    useEffect(() => {
        if (obtenerNumecon) {
        }
    }, [obtenerNumecon]);

    const handleEstatusChangeModal = (nuevoEstatus) => {
        // console.log('codigoNuevo cambiado a:', obtenerCodigo);
        if (user?.id == "AOROZCO" || user?.id == "RDIMAS" || user?.id == "AUXSISTEMAS") {
            if (nuevoEstatus == "1") {
                //openModalExtrasTI(); SE IBA A USAR PARA ABRIR EL MODAL DE EXTRAS TI PERO SE QUITA AUNQUE SIGUE FUNCIONANDO
            }
        }
    }
    //TERMINA MODAL PARA EXTRAS TI

    //MODAL PARA EDITAR ACTIVO FIJO
    const [showEditModal, setShowEditModal] = useState(false);
    const [assetSelected, setAssetSelected] = useState(false);
    const [activoEncontrado, setActivoEncontrado] = useState(false);



    const openEditModal = (cCodigoAfi) => { // Recibe el objeto chofer como argumento
        const activoSeleccionado = activosData.find(activo => activo.cCodigoAfi === cCodigoAfi);

        const codigoResponsable = activoSeleccionado.cResponsableAti || '';
        setResponsableActual(codigoResponsable); // Guarda el responsable actual
        sethistorico(activoSeleccionado);

        setActiveKey('general'); // Reinicia a la pestaña "General" al abrir el modal
        setActivoEncontrado(activosData.find(activo => activo.cCodigoAfi === cCodigoAfi));
        setAssetSelected(activosData.find(activo => activo.cCodigoAfi === cCodigoAfi)); // Guarda el activo seleccionado
        setShowEditModal(true);         // Abre el modal de edición
    }
    const closeEditModal = () => {
        setShowEditModal(false);
        setResponsableActual('');
        sethistorico('');
        setRecords('');
        setBusqueda('');
        setRecords([]);
    };

    // Inicializa el tooltip de Bootstrap en el encabezado de la columna
    useEffect(() => {
        const timer = setTimeout(() => {
            // TOOLTIP D
            if (headerRef.current && document.body.contains(headerRef.current)) {
                if (tooltipDRef.current) {
                    tooltipDRef.current.dispose();
                }
                tooltipDRef.current = new bootstrap.Tooltip(headerRef.current, {
                    title: 'Depreciar Activo',
                    placement: 'top',
                });
            }

            // TOOLTIP O
            if (opeHeaderRef.current && document.body.contains(opeHeaderRef.current)) {
                if (tooltipORef.current) {
                    tooltipORef.current.dispose();
                }
                tooltipORef.current = new bootstrap.Tooltip(opeHeaderRef.current, {
                    title: 'Activo Operativo',
                    placement: 'top',
                });
            }
        }, 100); // usa 100ms para evitar delay excesivo

        return () => {
            clearTimeout(timer);
            tooltipDRef.current?.dispose();
            tooltipDRef.current = null;
            tooltipORef.current?.dispose();
            tooltipORef.current = null;
        };
    }, [activosData, isPopupOpen]);

    //USO DE DATA-TABLE
    const columns = [
        {
            name: "Codigo AF",
            cell: row => (

                <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-edit-${row.cCodigoAfi}`}>Editar Activo</Tooltip>}>
                    <a type="button" onClick={() => openEditModal(row.cCodigoAfi)} style={{ textDecoration: 'none', color: 'blue' }}>
                        <i className="fas fa-user-edit fa-lg" style={{ marginRight: '5px', color: 'black' }}></i>{row.cCodigoAfi}
                    </a>
                </OverlayTrigger>
            ),
            selector: row => row.cCodigoAfi,
            sortable: true,
            width: '150px',
        },
        {
            name: "Nombre AF",
            selector: row => row.vNombreAfi,
            sortable: true,
            width: '200px',
        },
        {
            name: "Campo",
            selector: row => row.vNombreCam,
            sortable: true,
            width: '250px',
        },
        {
            name: "Usuario Asignado",
            selector: row => row.vNombreEmpleado,
            sortable: true,
            width: '350px',
        },
        {
            name: "Estado",
            selector: row => row.activo,
            sortable: true,
            width: '100px',
        },
        {
            name: "Marca",
            selector: row => row.vMarcaAfi,
            width: '180px',
        },
        {
            name: "Modelo",
            selector: row => row.vModeloAfi,
            width: '200px',
        },
        {
            name: "Num serie",
            selector: row => row.vNumserieAfi,
            width: '150px',
        },
        {
            name: (
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <span className="factura-header">
                        Factura
                    </span>
                </div>
            ),
            cell: row => {
                const facturaDisponible = row.cRutafactAfi != null && row.cRutafactAfi !== '';
                return (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        {facturaDisponible ? (
                            <a href={baseURL + '/CombustiblesApp/facturas/' + row.cRutafactAfi} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-file-pdf fa-lg" style={{ color: '#d22500' }}></i>
                            </a>
                        ) : (
                            <i className="fas fa-file-pdf fa-lg" style={{ color: '#000000ff' }}></i>
                        )}
                    </div>
                );
            },
            sortable: false, // La columna de la factura no necesita ser ordenable
        },
        {
            name: ( // Usamos la ref aquí
                <span ref={headerRef} className="no-depreciar-header">
                    D
                </span>
            ),
            cell: row => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.cNoDepreciarAfi === '1'}
                        readOnly
                        className="no-depreciar-checkbox"
                    />
                </div>
            ),
            width: '50px',
            sortable: true,
        },
        {
            name: ( // Usamos la ref aquí
                <span ref={opeHeaderRef} className="operativo-header">
                    O
                </span>
            ),
            cell: row => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={row.cOperativoAfi === '1'}
                        readOnly
                        className="operativo-checkbox"
                    />
                </div>
            ),
            width: '50px',
            sortable: true,
        }
        // {
        //     name: "O",
        //     cell: row => (
        //         <div style={{ display: 'flex', justifyContent: 'center' }}> {/* Añadido estilo para centrar */}
        //             <input
        //                 type="checkbox"
        //                 checked={row.cOperativoAfi === '1'}
        //                 readOnly
        //             />
        //         </div>
        //     ),
        //     width: '100px',
        //     sortable: true, // Puedes mantener la capacidad de ordenar si lo deseas
        // }
    ];

    const [records, setRecords] = useState([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (records.length === 0 && activosData) {
                setInitialLoadComplete(true); // Indica que la carga inicial con timeout se completó
            }
        }, 3000);

        // Función de limpieza para evitar fugas de memoria
        return () => clearTimeout(timeout);
    }, [activosData, records]); // Dependencias importantes

    //FUNCION PARA BUSQUEDA POR NOMBRE EN TABLE
    const [busqueda, setBusqueda] = useState(""); // Agrega este state arriba en tu componente
    const handleChange = (e) => {
        // console.log(records); // Puedes dejarlo para depuración, pero ya sabemos el problema
        const searchText = e.target.value.toLowerCase();
        setBusqueda(searchText); // ✅ Guardamos el texto original para el mensaje de "No encontrado"

        const filterRecords = activosData.filter(record => {
            const cCodigoAfi = record.cCodigoAfi ? record.cCodigoAfi.toLowerCase() : '';
            const vNombreAfi = record.vNombreAfi ? record.vNombreAfi.toLowerCase() : '';

            // ¡¡¡CAMBIO AQUÍ!!! Usa 'vNombreEmpleado' con 'v' minúscula
            const vNombreEmpleado = record.vNombreEmpleado ? record.vNombreEmpleado.toLowerCase() : '';
            const vNombreCam = record.vNombreCam ? record.vNombreCam.toLowerCase() : '';

            return (
                cCodigoAfi.includes(searchText) ||
                vNombreAfi.includes(searchText) ||
                vNombreEmpleado.includes(searchText) ||
                vNombreCam.includes(searchText)
            );
        });
        setRecords(filterRecords);
    };

    // Crea tu propio tema
    const customStyles = {
        rows: {
            style: {
                minHeight: '30px', // override the row height
            },
        },
        headCells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                fontSize: '1.3em',
                fontWeight: 'bold',
                fontFamily: 'TuFuentePersonalizada, sans-serif',
                backgroundColor: '#c6c6c6', // Agrega el color de fondo que desees
            },
        },

        cells: {
            style: {
                paddingLeft: '8px', // override the cell padding for data cells
                paddingRight: '8px',
            },
        },
    };

    const [activeKey, setActiveKey] = useState('general');

    const handleGenerarPDF = () => {
        if (searchEmpleado != "") {
            generarResponsivaPDF(formDataExtras, searchEmpleado); // Pasa tus datos a la función
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ocurrio un Error',
                text: 'Para generar Responsiva se necesita asignar un responsable.',
                confirmButtonColor: '#7c30b8', // Color morado de tu tema
                confirmButtonText: 'Entendido'
            });
            return; // Detiene la función aquí
        }
    };

    const handleGenerarInvPDF = () => {
        if (searchEmpleado != "") {
            generarInvPDF(formDataExtras, searchEmpleado); // Pasa tus datos a la función
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ocurrio un Error',
                text: 'Para generar la Carta de Bienvenida se necesita asignar un responsable.',
                confirmButtonColor: '#7c30b8', // Color morado de tu tema
                confirmButtonText: 'Entendido'
            });
            return; // Detiene la función aquí
        }
    };

    const checkSpecialCharForRoute = (e) => {
        const key = e.key;

        // Permitir:
        // 1. Números (0-9) y el punto decimal (.)
        const isNumberOrDot = /[0-9.]/.test(key);

        // 2. Teclas de control esenciales para la edición y navegación.
        // 'Backspace' es para borrar hacia atrás.
        // 'Delete' es para borrar hacia adelante.
        // 'ArrowLeft' / 'ArrowRight' son para mover el cursor.
        // 'Tab' es para salir del campo (aunque a menudo se maneja a nivel de formulario).
        const isControlKey = key === 'Backspace' ||
            key === 'Delete' ||
            key.startsWith('Arrow') ||
            key === 'Tab';

        // 3. Permitir Ctrl/Cmd + V (pegar), Ctrl/Cmd + X (cortar), etc.
        // Esto es vital para la usabilidad.
        const isCopyPaste = (e.ctrlKey || e.metaKey);

        if (isNumberOrDot || isControlKey || isCopyPaste) {
            // Permitir el evento (no hacer nada)
            return;
        } else {
            // Bloquear cualquier otra tecla (letras, símbolos, espacios, etc.)
            e.preventDefault();
        }
    };

    // Función para renderizar el contenido según el activeKey
    const renderContent = () => {
        switch (activeKey) {
            case 'general':
                return <div>
                    {activoEncontrado ? (
                        <Form onSubmit={handleSubmitEdit} style={{ fontSize: '0.9rem' }}>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group controlId="cCodigoAfi">
                                        <Form.Label>Código Activo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="cCodigoAfi" value={formDataEdit.cNumeconAfi || ''} onChange={handleInputChangeEdit} disabled />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="vNombreAfi">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNombreAfi" value={formDataEdit.vNombreAfi || ''} onChange={handleInputChangeEdit} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="vPlacasAfi">
                                        <Form.Label>Placas</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPlacasAfi" value={formDataEdit.vPlacasAfi || ''} onChange={handleInputChangeEdit} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr></hr>

                            <Row className="mb-3">
                                {!activoEncontrado.cRutafactAfi ? (
                                    <Col md={6}>
                                        <div className="col-md-12">
                                            <Form.Label htmlFor="archivoFactura" className="form-label me-2">Subir factura:</Form.Label>
                                            <Form.Control type="file" className="form-control" name="archivoFactura" id="archivoFactura" onChange={handleArchivoChange} style={{ fontSize: '12px' }} />
                                        </div>
                                    </Col>
                                ) : (
                                    <Col md={12}>
                                        <Alert variant="success">
                                            <Alert.Heading>Archivos en la nube</Alert.Heading>
                                            <p>
                                                La factura del activo <strong>{activoEncontrado.cCodigoAfi}</strong> ya se encuentra en el servidor.
                                            </p>
                                        </Alert>
                                    </Col>
                                )}
                            </Row>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                {/* {user?.id === "AOROZCO" || user?.id === "RDIMAS" ? ( */}
                                {/* <button type="button" className="btn btn-success" onClick={() => openModalExtrasTI()}>EXTRAS TI</button> */}
                                {/* ) : null} */}
                            </div>
                        </Form>
                    ) : (
                        <p>No hay activo seleccionado para editar.</p>
                    )}
                </div>;
            case 'RRHH':
                return <div>
                    {activoEncontrado ? (
                        <Form onSubmit={handleSubmitExtras} style={{ fontSize: '0.8rem' }}>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Datos Activo
                            </label>
                            <Row className="mb-3">
                                <Col md={1}>
                                    <Form.Group controlId="idActivoAti">
                                        <Form.Label>ID</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem', backgroundColor: '#e9ecef' }} type="text" name="idActivoAti" value={formDataExtras.idActivoAti || ''} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="cCodigoAfi">
                                        <Form.Label>Código Activo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem', backgroundColor: '#e9ecef' }} type="text" name="cCodigoAfi" value={formDataExtras.cNumeconAfi || ''} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="cCodigoCam">
                                        <Form.Label>Codigo de campo</Form.Label>
                                        <select className="form-select" id=" vTipoAti" name='cCodigoCam' value={formDataExtras.cCodigoCam || ''} onChange={handleInputChangeExtras} style={{ fontSize: '12px' }}>
                                            {/* Opción por defecto */}
                                            <option hidden value="">Seleccionar</option>

                                            {/* Usar .map() para generar las opciones dinámicamente */}
                                            {campos && campos.map(campo => (
                                                <option key={campo.cCodigoCam} value={campo.cCodigoCam}>
                                                    {campo.vNombreCam} - Cod:{campo.cCodigoCam}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="cResponsableAti">
                                        <Form.Label>Responsable de equipo:</Form.Label>
                                        {/* Input de búsqueda para empleados */}
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" placeholder="Buscar responsable..." name="cResponsableAti" value={searchEmpleado} onChange={handleSearchEmpleadoChange} />
                                        {/* Lista de resultados, se muestra solo si hay texto de búsqueda */}
                                        {mostrarListaEmpleados && (
                                            <ul className="list-group" style={{ position: 'absolute', zIndex: 1000, width: '40%', maxHeight: '200px', overflowY: 'auto' }}>
                                                {/* Filtrar los resultados */}
                                                {searchResultsEmpleados.filter(empleado =>
                                                    empleado.vNombreUsu.toLowerCase().includes(searchEmpleado.toLowerCase())
                                                ).length > 0 ? (
                                                    // Si hay resultados, mapearlos
                                                    searchResultsEmpleados.filter(empleado =>
                                                        empleado.vNombreUsu.toLowerCase().includes(searchEmpleado.toLowerCase())
                                                    ).map(empleado => (
                                                        <li key={empleado.cCodigoUsu} className="list-group-item list-group-item-action" onClick={() => handleSelectEmpleado(empleado)}>
                                                            {empleado.vNombreUsu} - {empleado.cCodigoUsu}
                                                        </li>
                                                    ))
                                                ) : (
                                                    // Si no hay resultados, mostrar un mensaje de 'no encontrado'
                                                    <li className="list-group-item text-danger">No se encontraron empleados.</li>
                                                )}
                                            </ul>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    {formDataExtras.vDocresponsivaAti && (<Form.Group controlId="vDocresponsivaAti">
                                        <Form.Label>Ver responsiva</Form.Label>
                                        <div>
                                            <a href={baseURL + '/CombustiblesApp/responsivas/' + formDataExtras.cNumeconAfi + '/' + formDataExtras.vDocresponsivaAti} target="_blank" rel="noopener noreferrer">
                                                <i className="fas fa-file-pdf fa-lg" style={{ color: '#d22500' }}></i>
                                            </a>
                                        </div>
                                    </Form.Group>)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group controlId="vDepartamentoAti">
                                        <Form.Label>Departamento</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vDepartamentoAti" value={formDataExtras.vDepartamentoAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Equipo
                            </label>
                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Label>Tipo de equipo</Form.Label>
                                    <select className="form-select" id="vTipoAti" name='vTipoAti' value={formDataExtras.vTipoAti || ''} onChange={handleInputChangeExtras} style={{ fontSize: '12px' }} disabled={true}>
                                        <option hidden value="">Seleccionar</option>
                                        <option value="PC">PC</option>
                                        <option value="LAPTOP">LAPTOP</option>
                                        <option value="TABLET">TABLET</option>
                                        <option value="MONITOR">MONITOR</option>
                                    </select>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vMarcaAti">
                                        <Form.Label>Marca</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vMarcaAti" value={formDataExtras.vMarcaAti || ''} onChange={handleInputChangeExtras} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vSerieAti">
                                        <Form.Label>Numero de Serie</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vSerieAti" value={formDataExtras.vSerieAti || ''} onChange={handleInputChangeExtras} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vModeloAti">
                                        <Form.Label>Modelo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vModeloAti" value={formDataExtras.vModeloAti || ''} onChange={handleInputChangeExtras} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="dFcompraAti">
                                        <Form.Label>Fecha Compra</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="date" name="dFcompraAti" value={formDataExtras.dFcompraAti || ''} onChange={handleInputChangeExtras} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="nCostoAti">
                                        <Form.Label>Costo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="nCostoAti" value={formDataExtras.nCostoAti || ''} onChange={handleInputChangeExtras} disabled={true} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Group controlId="vNombrePrv">
                                        <Form.Label>Nombre Provedor</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNombrePrv" value={formDataExtras.vNombrePrv} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="dFgarantiaAti">
                                        <Form.Label>Fecha de garantia</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="date" name="dFgarantiaAti" value={formDataExtras.dFgarantiaAti} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row> */}

                            <hr></hr>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Subir Documentos
                            </label>
                            <Row className="mb-3">
                                <Col md={5}>
                                    <div className="col-md-12">
                                        <Form.Label htmlFor="vDocresponsivaAti" className="form-label me-2">Responsiva firmada:</Form.Label>
                                        <Form.Control type="file" className="form-control" name="vDocresponsivaAti" id="vDocresponsivaAti" onChange={handleArchivoChangeResponsiva} style={{ fontSize: '12px' }} />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    {['checkbox'].map((type) => (
                                        <div key={`default-${type}`} className="mb-3" style={{ marginTop: '32px' }}>
                                            <Form.Check type={type} id="cResponsivaAti" name="cResponsivaAti" checked={!!formDataExtras.vDocresponsivaAti || ''} onChange={handleInputChangeExtras} label={`¿Se entrego responsiva?`} disabled={true} />
                                        </div>
                                    ))}
                                </Col>
                                <Col md={2}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div><p className="m-1 me-3 sizeLetra">Generar Responsiva</p></div>
                                        <button type="button" className="btn btn-danger" onClick={handleGenerarPDF}><i className="fas fa-file-pdf fa-lg" style={{ color: '#d0d0d0ff' }}></i></button>
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div><p className="m-1 me-3 sizeLetra">Carta Bienvenida</p></div>
                                        <button type="button" className="btn btn-primary" onClick={handleGenerarInvPDF}><i className="fas fa-file-pdf fa-lg" style={{ color: '#d0d0d0ff' }}></i></button>
                                    </div>
                                </Col>
                            </Row>

                            {errorMessageCarga && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessageCarga}
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                {/* {user?.id === "AOROZCO" || user?.id === "RDIMAS" ? ( */}
                                {/* <button type="button" className="btn btn-success" onClick={() => openModalExtrasTI()}>EXTRAS TI</button> */}
                                {/* ) : null} */}
                            </div>
                        </Form>
                    ) : (
                        <p>No hay activo seleccionado para editar.</p>
                    )}
                </div>;
            case 'ti':
                return <div>
                    {activoEncontrado ? (
                        <Form onSubmit={handleSubmitExtras} style={{ fontSize: '0.8rem' }}>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Datos Activo
                            </label>
                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Group controlId="idActivoAti">
                                        <Form.Label>ID</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem', backgroundColor: '#e9ecef' }} type="text" name="idActivoAti" value={formDataExtras.idActivoAti || ''} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="cCodigoAfi">
                                        <Form.Label>Código Activo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem', backgroundColor: '#e9ecef' }} type="text" name="cCodigoAfi" value={formDataExtras.cNumeconAfi || ''} disabled={true} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="cCodigoCam">
                                        <Form.Label>Codigo de campo</Form.Label>
                                        <select className="form-select" id=" vTipoAti" name='cCodigoCam' value={formDataExtras.cCodigoCam || ''} onChange={handleInputChangeExtras} style={{ fontSize: '12px' }}>
                                            {/* Opción por defecto */}
                                            <option hidden value="">Seleccionar</option>

                                            {/* Usar .map() para generar las opciones dinámicamente */}
                                            {campos && campos.map(campo => (
                                                <option key={campo.cCodigoCam} value={campo.cCodigoCam}>
                                                    {campo.vNombreCam} - Cod:{campo.cCodigoCam}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="cResponsableAti">
                                        <Form.Label>Responsable de equipo:</Form.Label>
                                        {/* Input de búsqueda para empleados */}
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" placeholder="Buscar responsable..." name="cResponsableAti" value={searchEmpleado} onChange={handleSearchEmpleadoChange} />
                                        {/* Lista de resultados, se muestra solo si hay texto de búsqueda */}
                                        {mostrarListaEmpleados && (
                                            <ul className="list-group" style={{ position: 'absolute', zIndex: 1000, width: '40%', maxHeight: '200px', overflowY: 'auto' }}>
                                                {/* Filtrar los resultados */}
                                                {searchResultsEmpleados.filter(empleado =>
                                                    empleado.vNombreUsu.toLowerCase().includes(searchEmpleado.toLowerCase())
                                                ).length > 0 ? (
                                                    // Si hay resultados, mapearlos
                                                    searchResultsEmpleados.filter(empleado =>
                                                        empleado.vNombreUsu.toLowerCase().includes(searchEmpleado.toLowerCase())
                                                    ).map(empleado => (
                                                        <li key={empleado.cCodigoUsu} className="list-group-item list-group-item-action" onClick={() => handleSelectEmpleado(empleado)}>
                                                            {empleado.vNombreUsu} - {empleado.cCodigoUsu}
                                                        </li>
                                                    ))
                                                ) : (
                                                    // Si no hay resultados, mostrar un mensaje de 'no encontrado'
                                                    <li className="list-group-item text-danger">No se encontraron empleados.</li>
                                                )}
                                            </ul>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group controlId="vDepartamentoAti">
                                        <Form.Label>Departamento</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vDepartamentoAti" value={formDataExtras.vDepartamentoAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Usuario y creedenciales
                            </label>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group controlId="vPlacvEmailAtiasAfi">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vEmailAti" value={formDataExtras.vEmailAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="vPwdemailAti">
                                        <Form.Label>Password Email</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPwdemailAti" value={formDataExtras.vPwdemailAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="vUsreclipseAti">
                                        <Form.Label>Usuario eclipse</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vUsreclipseAti" value={formDataExtras.vUsreclipseAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="vPwdeclipseAti">
                                        <Form.Label>Pwd eclipse</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPwdeclipseAti" value={formDataExtras.vPwdeclipseAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group controlId="vUsrrdAti">
                                        <Form.Label>Usuario Remoto</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vUsrrdAti" value={formDataExtras.vUsrrdAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="vPwdremotoAti">
                                        <Form.Label>Pwd Remoto</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vPwdremotoAti" value={formDataExtras.vPwdremotoAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="dFasignacionAti">
                                        <Form.Label>Fecha de asignación</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="date" name="dFasignacionAti" value={formDataExtras.dFasignacionAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Equipo
                            </label>
                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Label>Tipo de equipo</Form.Label>
                                    <select className="form-select" id="vTipoAti" name='vTipoAti' value={formDataExtras.vTipoAti || ''} onChange={handleInputChangeExtras} style={{ fontSize: '12px' }} >
                                        <option hidden value="">Seleccionar</option>
                                        <option value="PC">PC</option>
                                        <option value="LAPTOP">LAPTOP</option>
                                        <option value="TABLET">TABLET</option>
                                        <option value="MONITOR">MONITOR</option>
                                    </select>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vMarcaAti">
                                        <Form.Label>Marca</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vMarcaAti" value={formDataExtras.vMarcaAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vSerieAti">
                                        <Form.Label>Numero de Serie</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vSerieAti" value={formDataExtras.vSerieAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vModeloAti">
                                        <Form.Label>Modelo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vModeloAti" value={formDataExtras.vModeloAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="dFcompraAti">
                                        <Form.Label>Fecha Compra</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="date" name="dFcompraAti" value={formDataExtras.dFcompraAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vNombrePrv">
                                        <Form.Label>Nombre Provedor</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vNombrePrv" value={formDataExtras.vNombrePrv || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Group controlId="nCostoAti">
                                        <Form.Label>Costo</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="nCostoAti" value={formDataExtras.nCostoAti || ''} onKeyDown={(e) => checkSpecialCharForRoute(e)} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="dFgarantiaAti">
                                        <Form.Label>Fecha de garantia</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="date" name="dFgarantiaAti" value={formDataExtras.dFgarantiaAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Software y Hardware
                            </label>
                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Group controlId="vAntivirusAti">
                                        <Form.Label>Antivirus</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vAntivirusAti" value={formDataExtras.vAntivirusAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vOfficeAti">
                                        <Form.Label>Office</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vOfficeAti" value={formDataExtras.vOfficeAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vVerwindowsAti">
                                        <Form.Label>Versión de Windows</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vVerwindowsAti" value={formDataExtras.vVerwindowsAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vProcesadorAti">
                                        <Form.Label>Procesador</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vProcesadorAti" value={formDataExtras.vProcesadorAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vMemoriaAti">
                                        <Form.Label>Memoria RAM</Form.Label>
                                        <select className="form-select" id="vMemoriaAti" name='vMemoriaAti' value={formDataExtras.vMemoriaAti || ''} onChange={handleInputChangeExtras} style={{ fontSize: '12px' }}>
                                            <option hidden value="">Seleccionar</option>
                                            <option value="4 gb">4 gb</option>
                                            <option value="8 gb">8 gb</option>
                                            <option value="12 gb">12 gb</option>
                                            <option value="16 gb">16 gb</option>
                                        </select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group controlId="vDiscoduroAti">
                                        <Form.Label>Disco duro</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} type="text" name="vDiscoduroAti" value={formDataExtras.vDiscoduroAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group className="mb-3" controlId="vComentariosAti">
                                        <Form.Label>Comentarios</Form.Label>
                                        <Form.Control style={{ fontSize: '0.7rem' }} as="textarea" rows={3} name="vComentariosAti" value={formDataExtras.vComentariosAti || ''} onChange={handleInputChangeExtras} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr></hr>

                            {/* ////////////////////////////////////////////////////////////////////////////// */}
                            {/*
                        <label className="form-label" style={{ background: '#9b9b9bff', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                            Subir Documentos
                        </label>
                        <Row className="mb-3">
                            <Col md={6}>
                                <div className="col-md-12">
                                    <Form.Label htmlFor="vDocresponsivaAti" className="form-label me-2">Responsiva firmada:</Form.Label>
                                    <Form.Control type="file" className="form-control" name="vDocresponsivaAti" id="formDataExtras.vDocresponsivaAti" onChange={handleArchivoChange} style={{ fontSize: '12px' }} />
                                </div>
                            </Col>
                            <Col md={4}>
                                {['checkbox'].map((type) => (
                                    <div key={`default-${type}`} className="mb-3" style={{ marginTop: '32px' }}>
                                        <Form.Check type={type} id="cResponsivaAti" name="cResponsivaAti" checked={!!cResponsivaAti} onChange={handleInputChangeExtras} label={`¿Se entrego responsiva?`} disabled={true} />
                                    </div>
                                ))}
                            </Col>
                        </Row>*/}

                            {errorMessageCarga && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessageCarga}
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                {/* {user?.id === "AOROZCO" || user?.id === "RDIMAS" ? ( */}
                                {/* <button type="button" className="btn btn-success" onClick={() => openModalExtrasTI()}>EXTRAS TI</button> */}
                                {/* ) : null} */}
                            </div>
                        </Form>
                    ) : (
                        <p>No hay activo seleccionado para editar.</p>
                    )}
                </div>;
            default:
                return null;
        }
    }

    // Se inicializará con los datos de 'selectedChofer'
    const [formDataEdit, setFormDataEdit] = useState({
        cNumeconAfi: '',
        vNombreAfi: '',
        vPlacasAfi: '',
        cRutafactAfi: '',
    });

    // useEffect para inicializar formDataEdit cuando se selecciona un chofer para editar
    useEffect(() => {
        if (activoEncontrado) {
            setFormDataEdit({
                // Asegúrate de mapear todos los campos relevantes para la edición
                cNumeconAfi: activoEncontrado.cCodigoAfi || '', // ID es crucial para la actualización
                vNombreAfi: activoEncontrado.vNombreAfi || '',
                vPlacasAfi: activoEncontrado.vPlacasAfi || null,
                cRutafactAfi: activoEncontrado.cRutafactAfi || '',
            });
        }
    }, [activoEncontrado]);

    // Función para manejar el envío del formulario de EDICIÓN
    const handleSubmitEdit = async (event) => {
        event.preventDefault();
        setIsLoadingGuardado(true);

        const dataToSend = {
            ...formDataEdit,
            /*cNumeconAfi: activoEncontrado.cCodigoAfi,
            vNombreAfi: activoEncontrado.vNombreAfi, // Asegura el formato "0" o "1"
            vPlacasAfi: activoEncontrado.vPlacasAfi ? "TEST03" : null */
        };

        if (archivoAdjunto) {
            const formDataArchivo = new FormData();
            formDataArchivo.append('archivoFactura', archivoAdjunto);
            const uploadResult = await dispatch(uploadPDF(formDataArchivo));
            if (uploadResult && uploadResult.ruta) {
                dataToSend.cRutafactAfi = uploadResult.ruta;
            } else {
                setErrorMessage('Error al subir el archivo.');
                uploadSuccessful = false;
                setIsLoadingGuardado(false);
            }
        }

        // Llama al thunk de actualización
        const success = await dispatch(startUpdateActivo(dataToSend)); // Asegúrate de tener este thunk
        if (success) {
            setIsLoadingGuardado(false);
            dispatch(getActivos()); // Recarga los choferes para ver los cambios
            closeEditModal();
        } else {
            setIsLoadingGuardado(false);
            alert('Ocurrió un error al actualizar activo. Comunícate con Soporte TI.');
            closeEditModal();
        }
    };

    // Función para manejar cambios en los inputs del formulario de EDICIÓN
    const handleInputChangeEdit = (e) => {
        const { name, value, type, checked } = e.target;
        setFormDataEdit(prevData => ({
            ...prevData,
            //[name]: type === 'checkbox' ? 1 : 0,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
            //cResponsivaAti: activoEncontrado.cResponsivaAti === '1' ? 1 : 0 // Convierte el string '1' a número 1 y el resto a 0

        }));
    };

    //EDITAR EXTRAS TI
    // Función para manejar el envío del formulario de EDICIÓN
    const handleSubmitExtras = async (event) => {
        event.preventDefault();
        setIsLoadingGuardado(true);

        const dataToSend = {
            ...formDataExtras,
            /*cNumeconAfi: activoEncontrado.cCodigoAfi,
            vNombreAfi: activoEncontrado.vNombreAfi, // Asegura el formato "0" o "1"
            vPlacasAfi: activoEncontrado.vPlacasAfi ? "TEST03" : null */
        };

        const dataForHistoricApi = {
            cNumeconAfi: historico.cCodigoAfi || null,
            cReponsivaAti: historico.cReponsivaAti || null,
            cResponsableAti: historico.cResponsableAti || null,
            cCodigoCam: historico.cCodigoCam || null,
            vEmailAti: historico.vEmailAti || null,
            vPwdemailAti: historico.vPwdemailAti || null,
            vAntivirusAti: historico.vAntivirusAti || null,
            vOfficeAti: historico.vOfficeAti || null,
            vTipoAti: historico.vTipoAti || null,
            vMarcaAti: historico.vMarcaAti || null, // Asegúrate si es vMarcaAti o vMarcaAfi, la API espera vMarcaAti
            vSerieAti: historico.vNumserieAfi || null,
            dFcompraAti: historico.dFcompraAti || null,
            vNombrePrv: historico.vNombrePrv || null,
            nCostoAti: historico.nCostoAti || 0, // Asegura que sea un número
            dFgarantiaAti: historico.dFgarantiaAti || null,
            vModeloAti: historico.vModeloAti || null, // Asegúrate si es vModeloAti o vModeloAfi, la API espera vModeloAti
            dFasignacionAti: historico.dFasignacionAti || null,
            vVerwindowsAti: historico.vVerwindowsAti || null,
            vProcesadorAti: historico.vProcesadorAti || null,
            vMemoriaAti: historico.vMemoriaAti || null,
            vDiscoduroAti: historico.vDiscoduroAti || null,
            vUsreclipseAti: historico.vUsreclipseAti || null,
            vPwdeclipseAti: historico.vPwdeclipseAti || null,
            vUsrrdAti: historico.vUsrrdAti || null,
            vPwdremotoAti: historico.vPwdremotoAti || null,
            vComentariosAti: historico.vComentariosAti || null,
            vDocresponsivaAti: historico.vDocresponsivaAti || null,
            vDepartamentoAti: historico.vDepartamentoAti || null,
        };

        if (responsableActual != '' && responsableActual !== dataToSend.cResponsableAti) {
            console.log('El responsable ha cambiado, se debe hacer un respaldo antes de continuar.');
            const success = await dispatch(startHistoricoExtrasTI(dataForHistoricApi));
            if (success) {
                console.log('Se actualizó el responsable correctamente, ahora se crea el respaldo en historicoExtrasTI.');
            } else {
                console.log('No se pudo actualizar el responsable, no se crea el respaldo en historicoExtrasTI.');
            }
        } else {
            console.log('El responsable NO ha cambiado, continuar normalmente.');

        }


        if (archivoAdjuntoResponsiva) {
            const formDataArchivo = new FormData();
            formDataArchivo.append('archivoResponsiva', archivoAdjuntoResponsiva);
            // const uploadResult = await dispatch(uploadPDF(formDataArchivo));
            const uploadResult = await dispatch(uploadResponsiva(formDataArchivo, dataToSend.cNumeconAfi.trim()));
            if (uploadResult && uploadResult.ruta) {
                dataToSend.vDocresponsivaAti = uploadResult.ruta;
            } else {
                setErrorMessage('Error al subir el archivo.');
                uploadSuccessful = false;
                setIsLoadingGuardado(false);
            }
        }

        // console.log('Datos a enviar:', dataToSend);
        // return

        // Llama al thunk de actualización
        const success = await dispatch(modificarExtras(dataToSend)); // Asegúrate de tener este thunk
        if (success) {
            // ✅ 1. Cerramos el modal primero para liberar la pantalla
            closeEditModal();

            // ✅ 2. Esperamos a que la animación de cierre termine (300ms)
            // Esto evita que la tabla se refresque con el ancho "bugeado" del modal
            setTimeout(() => {
                dispatch(getActivos(familiaSeleccionada)); // Pasa la familia actual para no perder el filtro
                setIsLoadingGuardado(false);
            }, 300);

        } else {
            setIsLoadingGuardado(false);
            alert('Ocurrió un error al actualizar EXTRAS. Comunícate con Soporte TI.');
            closeEditModal();
        }
    };

    const [formDataExtras, setFormDataExtras] = useState({
        idActivoAti: null,
        cNumeconAfi: '',
        cReponsivaAti: '',
        cResponsableAti: '',
        cCodigoCam: '',
        vEmailAti: '',
        vPwdemailAti: '',
        vAntivirusAti: '',
        vOfficeAti: '',
        vTipoAti: '',
        vMarcaAti: '',
        vSerieAti: '',
        dFcompraAti: null,
        vNombrePrv: '',
        nCostoAti: null,
        dFgarantiaAti: null,
        vModeloAti: '',
        dFasignacionAti: null,
        vVerwindowsAti: '',
        vProcesadorAti: '',
        vMemoriaAti: '',
        vDiscoduroAti: '',
        vUsreclipseAti: '',
        vPwdeclipseAti: '',
        vUsrrdAti: '',
        vPwdremotoAti: '',
        vComentariosAti: '',
        vDocresponsivaAti: '',
        vDepartamentoAti: ''
    });

    // useEffect para inicializar formDataExtras cuando se selecciona un activo para editar
    useEffect(() => {
        if (activoEncontrado && searchResultsEmpleados.length > 0) {

            const responsableCodigo = activoEncontrado.cResponsableAti || '';
            // Busca el objeto del empleado en la lista.
            const empleadoEncontrado = searchResultsEmpleados.find(
                empleado => empleado.cCodigoUsu.trim() === responsableCodigo
            );
            const nombreResponsable = empleadoEncontrado ? empleadoEncontrado.vNombreUsu : '';

            setFormDataExtras({
                // Mapeo de campos de ZAfiactivoti
                idActivoAti: activoEncontrado.idActivoAti || null,
                cNumeconAfi: activoEncontrado.cNumeconAfiExtra || '',
                cReponsivaAti: activoEncontrado.cReponsivaAti || '',
                cResponsableAti: activoEncontrado.cResponsableAti || '',
                cCodigoCam: activoEncontrado.cCodigoCam || '',
                vEmailAti: activoEncontrado.vEmailAti || '',
                vPwdemailAti: activoEncontrado.vPwdemailAti || '',
                vAntivirusAti: activoEncontrado.vAntivirusAti || '',
                vOfficeAti: activoEncontrado.vOfficeAti || '',
                vTipoAti: activoEncontrado.vTipoAti || '',
                vMarcaAti: activoEncontrado.vMarcaAti || '',
                vSerieAti: activoEncontrado.vSerieAti || '',
                dFcompraAti: activoEncontrado.dFcompraAti || null,
                vNombrePrv: activoEncontrado.vNombrePrv || '',
                nCostoAti: activoEncontrado.nCostoAti || 0.00,
                dFgarantiaAti: activoEncontrado.dFgarantiaAti || null,
                vModeloAti: activoEncontrado.vModeloAti || '',
                dFasignacionAti: activoEncontrado.dFasignacionAti || null,
                vVerwindowsAti: activoEncontrado.vVerwindowsAti || '',
                vProcesadorAti: activoEncontrado.vProcesadorAti || '',
                vMemoriaAti: activoEncontrado.vMemoriaAti || '',
                vDiscoduroAti: activoEncontrado.vDiscoduroAti || '',
                vUsreclipseAti: activoEncontrado.vUsreclipseAti || '',
                vPwdeclipseAti: activoEncontrado.vPwdeclipseAti || '',
                vUsrrdAti: activoEncontrado.vUsrrdAti || '',
                vPwdremotoAti: activoEncontrado.vPwdremotoAti || '',
                vComentariosAti: activoEncontrado.vComentariosAti || '',
                vDocresponsivaAti: activoEncontrado.vDocresponsivaAti || '',
                vDepartamentoAti: activoEncontrado.vDepartamentoAti || ''
            });
            // 2. Llenar el estado de búsqueda con el nombre del responsable de la DB
            // Esto asegura que el input no se muestre vacío al cargar
            setSearchEmpleado(nombreResponsable);
        }
    }, [activoEncontrado, searchResultsEmpleados]);

    // Función para manejar cambios en los inputs del formulario de EDICIÓN
    const handleInputChangeExtras = (e) => {
        const { name, value, type, checked } = e.target;
        setFormDataExtras(prevData => ({
            ...prevData,
            //[name]: type === 'checkbox' ? 1 : 0,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
            //cResponsivaAti: activoEncontrado.cResponsivaAti === '1' ? 1 : 0 // Convierte el string '1' a número 1 y el resto a 0

        }));
    };

    //AGREGAR EXTRAS TI
    const {
        cResponsivaAti,
        cResponsableAti,
        cCodigoCam,
        vEmailAti,
        vPwdemailAti,
        vAntivirusAti,
        vOfficeAti,
        vTipoAti,
        vMarcaAti,
        vSerieAti,
        dFcompraAti,
        vNombrePrv,
        nCostoAti,
        dFgarantiaAti,
        vModeloAti,
        dFasignacionAti,
        vVerwindowsAti,
        vProcesadorAti,
        vMemoriaAti,
        vDiscoduroAti,
        vUsreclipseAti,
        vPwdeclipseAti,
        vUsrrdAti,
        vPwdremotoAti,
        vComentariosAti,
        vDocresponsivaAti,
        vDepartamentoAti,
        onInputChange,
        onResetForm
    } = useForm({
        cResponsivaAti: 0,
        cResponsableAti: '',
        cCodigoCam: '',
        vEmailAti: '',
        vPwdemailAti: '',
        vAntivirusAti: '',
        vOfficeAti: '',
        vTipoAti: '',
        vMarcaAti: '',
        vSerieAti: '',
        dFcompraAti: '',
        vNombrePrv: '',
        nCostoAti: '',
        dFgarantiaAti: '',
        vModeloAti: '',
        dFasignacionAti: '',
        vVerwindowsAti: '',
        vProcesadorAti: '',
        vMemoriaAti: '',
        vDiscoduroAti: '',
        vUsreclipseAti: '',
        vPwdeclipseAti: '',
        vUsrrdAti: '',
        vPwdremotoAti: '',
        vComentariosAti: '',
        vDocresponsivaAti: '',
        vDepartamentoAti: ''
    });


    const [errorMessageCarga, setErrorMessageCarga] = useState('');

    // AGREGAR FACTURA Y RESPONSIVA
    const [archivoAdjunto, setArchivoAdjunto] = useState(null); // Estado para el archivo adjunto
    const handleArchivoChange = (event) => {
        setArchivoAdjunto(event.target.files[0]);
    };

    const [archivoAdjuntoResponsiva, setArchivoAdjuntoResponsiva] = useState(null); // Estado para el archivo adjunto
    const handleArchivoChangeResponsiva = (event) => {
        setArchivoAdjuntoResponsiva(event.target.files[0]);
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
            <hr />
            <hr />
            <hr />
            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="rounded-3" style={{ background: '#7c30b8', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Activos Fijos</strong>
                </div>

                <Row className="mb-3 align-items-end">
                    {/* SELECTOR DE FAMILIA */}
                    <Col md={3}>
                        <p className="m-2 me-3 sizeLetra">Seleccionar Familia:</p>
                        <Form.Select
                            value={familiaSeleccionada}
                            onChange={(e) => {
                                const valor = e.target.value;
                                setFamiliaSeleccionada(valor);
                                dispatch(getActivos(valor)); // Dispara la búsqueda con el prefijo (ej: "CAM")
                            }}
                            style={{ fontSize: '0.9rem' }}
                        >
                            <option value="">Todas las familias</option>

                            {subfamilias && Object.values(subfamilias).map((fam) => (
                                <option key={fam.cCodigoAff} value={fam.cPrefijoAff?.trim()}>
                                    {fam.cPrefijoAff?.trim()} - {fam.vNombreAff?.trim()}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col md={5}>
                        <InputGroup>
                            <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                            <FormControl
                                placeholder="Buscar por Código, Nombre, Empleado o Campo..."
                                onChange={handleChange}
                                value={busqueda}
                            />
                        </InputGroup>
                    </Col>

                    <Col md={4} className="text-end">
                        <button className="btn btn-secondary rounded-2 m-1" onClick={() => openActivoPopup(<AddActivo onClose={closeActivoPopup} />)}>
                            <i className="fas fa-plus"></i> Agregar Activo
                        </button>
                    </Col>
                </Row>

                <div className="table-responsive mt-3" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover">
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                <th>Código AF</th>
                                <th>Nom AF</th>
                                <th>Campo</th>
                                <th>Usuario aginado</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>No. serie</th>
                                <th>Factura</th>
                                <th>D</th>
                                <th>O</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isLoading ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-5">
                                            <div className="spinner-border" style={{ color: '#792482' }} role="status"></div>
                                            <div className="mt-2" style={{ color: '#792482', fontWeight: 'bold' }}>
                                                Buscando activos...
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Cambiamos la lógica aquí: 
                                    // Si hay algo escrito en 'busqueda', usamos 'records'. 
                                    // Si no hay nada escrito, usamos 'activosData'.
                                    (busqueda.trim() !== "" ? records : activosData).length > 0 ? (
                                        (busqueda.trim() !== "" ? records : activosData).map((item) => {
                                            const campoEncontrado = campos.find(campo => campo.cCodigoCam === item.cCodigoCam);
                                            return (
                                                <tr key={`${item.idActivoAti}-${item.cCodigoAfi}`}>
                                                    <td onClick={() => openEditModal(item.cCodigoAfi)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                                        <i className="fas fa-user-edit fa-lg" style={{ marginRight: '5px', color: '#7c30b8' }}></i>
                                                        {item.cCodigoAfi}
                                                    </td>
                                                    <td>{item.vNombreAfi}</td>
                                                    <td>{campoEncontrado ? campoEncontrado.vNombreCam : "N/A"}</td>
                                                    <td>{item.vNombreEmpleado || "Sin asignar"}</td>
                                                    <td>{item.vMarcaAfi}</td>
                                                    <td>{item.vModeloAfi}</td>
                                                    <td>{item.vNumserieAfi}</td>
                                                    <td>
                                                        <div style={{ width: '100%', textAlign: 'center' }}>
                                                            {item.cRutafactAfi ? (
                                                                <a href={baseURL + '/CombustiblesApp/facturas/' + item.cRutafactAfi} target="_blank" rel="noopener noreferrer">
                                                                    <i className="fas fa-file-pdf fa-lg" style={{ color: '#d22500' }}></i>
                                                                </a>
                                                            ) : (
                                                                <i className="fas fa-file-pdf fa-lg" style={{ color: '#000000ff' }}></i>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <input type="checkbox" checked={item.cNoDepreciarAfi === '1'} readOnly />
                                                    </td>
                                                    <td className="text-center">
                                                        <input type="checkbox" checked={item.cOperativoAfi === '1'} readOnly />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-4">
                                                <span style={{ color: '#792482' }}>
                                                    <i className="fas fa-search-minus me-2"></i>
                                                    No se encontraron activos para la búsqueda actual.
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )
                            }
                        </tbody>
                    </table>
                </div>

                <table ref={tableRef} style={{ display: 'none' }}>
                    <thead>
                        <tr>
                            <th>Código AF</th>
                            <th>Nombre AF</th>
                            <th>Campo</th>
                            <th>Usuario aginado</th>
                            <th>Departamento</th>
                            <th>Correo Electronico</th>
                            <th>Marca equipo</th>
                            <th>Modelo</th>
                            <th>Número de serie</th>
                            <th>Fecha Compra</th>
                            <th>Costo</th>
                            <th>Garantia</th>
                            <th>Fecha Asignacion</th>
                            <th>Sist operativo</th>
                            <th>Procesador</th>
                            <th>Memoria RAM</th>
                            <th>Disco duro</th>
                            <th>Antivirus</th>
                            <th>Office</th>
                            <th>Comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(records.length === 0 ? activosData : records).map((item) => {
                            const campoEncontrado = campos.find(campo => campo.cCodigoCam === item.cCodigoCam);

                            return (
                                /* ✅ CAMBIO: Usar idActivoAti en lugar de idx */
                                <tr key={`${item.idActivoAti}-${item.cCodigoAfi}`}>
                                    <td onClick={() => openEditModal(item.cCodigoAfi)}>{item.cCodigoAfi}</td>
                                    <td>{item.vNombreAfi}</td>
                                    <td>{campoEncontrado ? campoEncontrado.vNombreCam : "N/A"}</td>
                                    <td>{item.vNombreEmpleado}</td>
                                    <td>{item.vDepartamentoAti}</td>
                                    <td>{item.vEmailAti}</td>
                                    <td>{item.vMarcaAti}</td>
                                    <td>{item.vModeloAti}</td>
                                    <td>{item.vSerieAti}</td>
                                    <td>{item.dFcompraAti}</td>
                                    <td>{item.nCostoAti}</td>
                                    <td>{item.dFgarantiaAti}</td>
                                    <td>{item.dFasignacionAti}</td>
                                    <td>{item.vVerwindowsAti}</td>
                                    <td>{item.vProcesadorAti}</td>
                                    <td>{item.vMemoriaAti}</td>
                                    <td>{item.vDiscoAti}</td>
                                    <td>{item.vAntivirusAti}</td>
                                    <td>{item.vOfficeAti}</td>
                                    <td>{item.vComentariosAti}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* CODIGO DE FRANK */}
                {/* <div className="container-fluid overflow-auto" id="containerPagesTable">
                    <table className="table table-bordered table-dark table-striped-columns table-hover" >
                        <thead>
                            <tr>
                                <th scope="col">Codigo AF</th>
                                <th scope="col">Nombre AF</th>
                                <th scope="col">Lote</th>
                                <th scope="col">Actividad</th>
                                <th scope="col">Cultivo</th>
                                <th scope="col">Num serie</th>
                                <th scope="col">Codigo de relacion</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ActivosList/>
                        </tbody>
                    </table>
                </div> */}
                {/*<div className="data-table-container">  Contenedor con altura definida */}
                {/* <div className="contenedor-de-la-tabla">
                    <DataTable
    className="mi-tabla-activos"
    customStyles={customStyles}
    columns={columns}
    // ✅ Agregamos esta línea:
    keyField="idActivoAti" 
    data={initialLoadComplete ? (records.length === 0 ? activosData : records) : []}
    fixedHeader
    progressPending={!initialLoadComplete}
    progressComponent={
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <img
                src={leaf_loader_slow}
                alt="Cargando..."
                style={{ width: '64px', height: '64px' }}
            />
            <span style={{ marginTop: '10px' }}>Cargando...</span>
        </div>
    }
    fluid 
/>
                </div> */}
                <hr />
                {/* </div> */}
                <div className="ms-2 mb-1 mt-2">
                    {/* <button className="btn btn-secondary rounded-2 m-1" onClick={() => openActivoPopup(<AddActivo onClose={closeActivoPopup} />)}>Agregar AF</button> */}
                    <DownloadTableExcel
                        filename="Activos Fijos"
                        sheet="Activos"
                        currentTableRef={tableRef.current}
                    >
                        <button className="btn rounded-2" style={{ background: '#218838', color: '#ffff' }}>
                            <i className="fas fa-file-excel me-2"></i>
                            Registros ({
                                // Si records tiene algo, mostramos su tamaño, 
                                // si no, mostramos el tamaño de activosData
                                records.length > 0 ? records.length : activosData.length
                            })
                        </button>
                    </DownloadTableExcel>
                    {/* <button className="btn btn-outline-primary rounded-2 m-1" onClick={() => openActivoPopup(<ModVehicle onClose={closeActivoPopup} />)}>Modificar</button> */}
                    {/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openVehiclePopup(<DelVehicle onClose={ closeVehiclePopup }/>) }>Eliminar</button> */}
                </div>
                {/* Renderizado condicional del modal FUERA de la tabla */}
                {isPopupOpen && (
                    <AddActivo onClose={closeActivoPopup} subfamilias={subfamilias} handleEstatusChange={handleEstatusChange} />
                )}
            </div>

            {/* Editar ACTIVO FIJO */}
            <Modal show={showEditModal} onHide={closeEditModal} size="xl" centered>
                <Modal.Header style={{ background: '#7c30b8' }} closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Administración de Activo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Nav justify variant="tabs" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
                        <Nav.Item>
                            <Nav.Link
                                eventKey="general"
                                style={activeKey === 'general' ? { backgroundColor: '#bec1c4', color: '#000' } : {}}
                            >
                                Datos Generales
                            </Nav.Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Nav.Link
                                eventKey="RRHH"
                                style={activeKey === 'RRHH' ? { backgroundColor: '#bec1c4', color: '#000' } : {}}
                            >
                                Administración RRHH
                            </Nav.Link>
                        </Nav.Item>

                        {(user?.id === "AOROZCO" || user?.id === "RDIMAS" || user?.id === "AUXSISTEMAS") && (
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="ti"
                                    style={activeKey === 'ti' ? { backgroundColor: '#bec1c4', color: '#000' } : {}}
                                >
                                    Extras TI
                                </Nav.Link>
                            </Nav.Item>
                        )}
                    </Nav>
                    <br></br>
                    {renderContent()}
                    {/* <p>Acceso solo para administradores: {user?.id}</p> */}
                </Modal.Body>
            </Modal>

            {/* MODAL DE CARGA AL INSERTAR */}
            <Modal show={isLoadingGuardado} centered>
                <Modal.Body className="text-center">
                    {/* <Spinner animation="border" role="status" className="mb-2" /> */}
                    <img src={leaf_loader_slow} alt="Cargando..." style={{ width: '64px', height: '64px' }} />
                    <p>Guardando activo fijo...</p>
                </Modal.Body>
            </Modal>
        </>
    )
}