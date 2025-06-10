import { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getChoferes } from "../../store/slices/vehicleAccess";
//import table from 'react-bootstrap/Table';
import { Modal, Button, OverlayTrigger, Tooltip, FormControl, Form, InputGroup } from 'react-bootstrap';
import leaf_loader_slow from '../../../assets/leaf_loader_slow.gif';
import dayjs from 'dayjs';
import { AuthContext } from '../../auth/context/AuthContext';
import { startAddChofer, startUpdateChofer } from "../../store/slices/vehicleAccess";

export const CatalogoChoferesPage = () => {

    // Peticion para traer datos //////////
    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);
    // const { choferes = [] } = useSelector((state) => state.vehicleAccess);
    const choferes = useSelector((state) => Object.values(state.vehicleAccess.choferes || {}));

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getChoferes());
        };
        fetchData();
    }, [dispatch]);
    //console.log("Choferes:", choferes); // <---- ¿Qué se imprime aquí?
    ///////////////////////////////////////

    // Estados y funciones para el modal de AGREGAR
    const [showModal, setShowModal] = useState(false);
    const openModal = () => {
        setShowModal(true);
    }
    const closeModal = () => {
        setShowModal(false);
        // --- ¡Paso clave para limpiar los campos! ---
        setFormData({
            // cCodigoAfc: '',
            vNombreAfc: '',
            cTipolicenciaAfc: '',
            vNumlicenciaAfc: '',
            dValidaAfc: '',
            cCodigoUsu: user?.id,
            dCreacionAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            cUsumodAfc: null,
            dModifiAfc: null,
            cActivoAfc: true,
            cLoginAfc: '',
        });
    };

    //AGREGAR chofer //////////////////////////////////////////////////////////
    // Un solo objeto de estado para manejar todos los valores del formulario
    const [formData, setFormData] = useState({
        // cCodigoAfc: '',
        vNombreAfc: '',
        cTipolicenciaAfc: '',
        vNumlicenciaAfc: '', //puede ir null
        dValidaAfc: '',
        cCodigoUsu: user?.id,
        dCreacionAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        cUsumodAfc: null, //puede ir null
        dModifiAfc: null, //puede ir null
        cActivoAfc: true,
        cLoginAfc: '',
    });

    const handleInputChange = (event) => {
        // Extrae el 'name' y el 'value' del input que disparó el evento
        // el 'name' debe coincidir con la clave en tu objeto de estado
        const { name, value, type, checked } = event.target;
        const idDelInput = event.target.id; // También puedes obtener el ID

        setFormData(prevData => ({
            ...prevData, // Copia el estado anterior
            [name]: type === 'checkbox' ? checked : value, // Actualiza solo la propiedad correspondiente al 'name' del input
        }));

        // console.log(`Input con ID: ${idDelInput} y Nombre: ${name} cambió a: ${value}`);
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Evita que la página se recargue
        setShowLoadingModal(true);

        // const ahora = new Date();
        // const horas = ahora.getHours().toString().padStart(2, '0');
        // const minutos = ahora.getMinutes().toString().padStart(2, '0');
        // const segundos = ahora.getSeconds().toString().padStart(2, '0');
        // const horaFormateada = `${horas}:${minutos}:${segundos}`;

        const dataToSend = {
            ...formData,
            cActivoAfc: formData.cActivoAfc ? "1" : "0", // Convert true to 1, false to 0
            // dValidaAfc: formData.dValidaAfc+'T'+horaFormateada, esto funciona en caso de que necesite la hora del sistema
            dValidaAfc: dayjs(formData.dValidaAfc).format("YYYY-MM-DDTHH:mm:ss")

        };
        // console.log('Datos del formulario enviados:', dataToSend);
        // alert('Datos enviados: ' + JSON.stringify(dataToSend, null, 2)); //enviar esto a la api

        // --- Importante: Si estás usando Redux/Axios, generalmente no necesitas JSON.stringify aquí. ---
        // Si usas Redux Thunk y una librería como Axios, pasarías el objeto directamente:
        // const success = await dispatch(startAddNewActivoFijo(dataToSend));
        // Axios se encarga de serializar dataToSend a JSON automáticamente en el body.
        // Si usas fetch API, entonces sí necesitarías:
        // body: JSON.stringify(dataToSend)

        const success = await dispatch(startAddChofer(dataToSend));
        if (success) {
            if (!bandera) {
                setBandera(true);
            }
            setShowLoadingModal(false);
            dispatch(getChoferes()); //segun es para actualizar
            closeModal();
        } else {
            setShowLoadingModal(false);
            alert('Ocurrio un error comunicate con Soporte TI');
            closeModal();
        }


    };
    //Termina AGREGAR chofer //////////////////////////////////////////////////////////

    // Funciones para el modal de EDICIÓN
    const [showEditModal, setShowEditModal] = useState(false);       // Nuevo estado para el modal de edición
    const [selectedChofer, setSelectedChofer] = useState(null);      // Estado para guardar el chofer seleccionado para editar

    // Se inicializará con los datos de 'selectedChofer'
    const [formDataEdit, setFormDataEdit] = useState({
        cCodigoAfc: '',
        vNombreAfc: '',
        cTipolicenciaAfc: '',
        vNumlicenciaAfc: '',
        dValidaAfc: '',
        cUsumodAfc: user?.id,
        dModifiAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        cActivoAfc: '', // Será un string "0" o "1"
        cLoginAfc: ''
    });

    // useEffect para inicializar formDataEdit cuando se selecciona un chofer para editar
    useEffect(() => {
        if (selectedChofer) {
            setFormDataEdit({
                // Asegúrate de mapear todos los campos relevantes para la edición
                cCodigoAfc: selectedChofer.cCodigoAfc || '', // ID es crucial para la actualización
                vNombreAfc: selectedChofer.vNombreAfc || '',
                cTipolicenciaAfc: selectedChofer.cTipolicenciaAfc || '',
                vNumlicenciaAfc: selectedChofer.vNumlicenciaAfc || '',
                dValidaAfc: selectedChofer.dValidaAfc ? dayjs(selectedChofer.dValidaAfc).format('YYYY-MM-DD') : '',
                cCodigoUsu: selectedChofer.cCodigoUsu.trim() || '',
                dCreacionAfc: selectedChofer.dCreacionAfc ? dayjs(selectedChofer.dCreacionAfc).format('YYYY-MM-DD') : '',
                cUsumodAfc: user?.id, // Usuario que modifica
                dModifiAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Fecha de modificación
                cActivoAfc: selectedChofer.cActivoAfc === '1' ? '1' : '0',
                cLoginAfc: selectedChofer.cLoginAfc?.trim() || '',
            });
        }
    }, [selectedChofer, user?.id]);

    const openEditModal = (chofer) => { // Recibe el objeto chofer como argumento
        setSelectedChofer(chofer);      // Guarda el chofer en el estado
        setShowEditModal(true);         // Abre el modal de edición
    }
    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedChofer(null); // Limpia el chofer seleccionado al cerrar el modal
        // Opcional: limpiar formDataEdit si quieres que se reinicie al abrir de nuevo
        setFormDataEdit({
            vNombreAfc: '',
            cTipolicenciaAfc: '',
            vNumlicenciaAfc: '',
            dValidaAfc: '',
            cUsumodAfc: user?.id,
            dModifiAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            cActivoAfc: '',
            cLoginAfc: ''
        });
    };

    // Función para manejar cambios en los inputs del formulario de EDICIÓN
    const handleInputChangeEdit = (e) => {
        const { name, value, type, checked } = e.target;
        setFormDataEdit(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // // Función para manejar el envío del formulario de EDICIÓN
    const handleSubmitEdit = async (event) => {
        event.preventDefault();
        setShowLoadingModal(true);

        const dataToSend = {
            ...formDataEdit,
            cActivoAfc: formDataEdit.cActivoAfc === '1' ? '1' : '0', // Asegura el formato "0" o "1"
            dModifiAfc: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Actualiza la fecha de modificación
            cUsumodAfc: user?.id, // Asegura que el usuario que modifica sea el actual
        };

        // console.log('Datos del formulario enviados:', dataToSend);
        // alert('Datos enviados: ' + JSON.stringify(dataToSend, null, 2)); ;
        // return

        // Llama al thunk de actualización
        const success = await dispatch(startUpdateChofer(dataToSend)); // Asegúrate de tener este thunk
        if (success) {
            setShowLoadingModal(false);
            dispatch(getChoferes()); // Recarga los choferes para ver los cambios
            closeEditModal();
        } else {
            setShowLoadingModal(false);
            alert('Ocurrió un error al actualizar el chofer. Comunícate con Soporte TI.');
            closeEditModal();
        }
    };

    //Busqueda de choferes por nombre //////////////////////////
    // Nuevo estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    // Función para manejar el cambio en el input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    // Filtrar los choferes basados en el término de búsqueda, buscando en nombre o usuario
    const filteredChoferes = choferes.filter(chofer => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            chofer.vNombreAfc.toLowerCase().includes(lowerCaseSearchTerm) ||
            chofer.cLoginAfc.toLowerCase().includes(lowerCaseSearchTerm)
        );
    });
    //////////////////////////////////////////////////////////

    // Estado local para controlar la visibilidad del modal de carga
    const [showLoadingModal, setShowLoadingModal] = useState(true);
    const [bandera, setBandera] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (choferes.length > 0) {
                setShowLoadingModal(false); // Indica que la carga inicial con timeout se completó
            } else {
                setShowLoadingModal(false);
                setBandera(false);
            }
        }, 1000);

        // Función de limpieza para evitar fugas de memoria
        return () => clearTimeout(timeout);
    }, [choferes]);
    /////////////////////////////////////////////////////////

    const [selectedValue, setSelectedValue] = useState('');
    const handleCheckActivo = (e) => {
        setSelectedValue(e.target.value);
    };

    return (
        <>
            <br />
            <br />
            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="rounded-3" style={{ background: '#198754', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Catálogo de Choferes</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3" style={{ marginBottom: '1%' }}>
                    <p className="m-0">Consulta y registro de choferes internos.</p>
                    {/* Input de búsqueda */}
                    <FormControl type="text" placeholder="Buscar por nombre o usuario..." className="me-2" value={searchTerm} onChange={handleSearchChange} style={{ width: '300px' }} />
                </div>

                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className='table table-striped table-hover' style={{ fontSize: '14px', borderCollapse: 'separate', borderSpacing: '0px', tableLayout: 'fixed', width: '100%', height: '10px' }}>
                        <thead style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                            <tr>
                                <th scope="col" style={{ background: '#198754', color: 'white', padding: '5px', borderRight: '1px solid #ffffff', borderTopLeftRadius: '10px' }}>Nombre chofer</th>
                                <th scope="col" style={{ background: '#198754', color: 'white', padding: '5px', borderRight: '1px solid #ffffff' }}>Licencia</th>
                                <th scope="col" style={{ background: '#198754', color: 'white', padding: '5px', borderRight: '1px solid #ffffff', textAlign: 'center' }}>Activo</th>
                                <th scope="col" style={{ background: '#198754', color: 'white', padding: '5px', borderRight: '1px solid #ffffff' }}>Usuario</th>
                                <th scope="col" style={{ background: '#198754', color: 'white', padding: '5px', borderRight: '1px solid #ffffff', borderTopRightRadius: '10px' }}>Código chofer</th>
                            </tr>
                        </thead>
                        {bandera ? (
                            <tbody>
                                {/* {console.log("Choferes siendo mapeados:", filteredChoferes.map(item => item.cCodigoAfc))}  */}
                                {filteredChoferes.map((item) => (
                                    <tr key={item.cCodigoAfc}>
                                        <td style={{ padding: '2px', cursor: 'pointer' }}>
                                            <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-edit-${item.cCodigoAfc}`}>Editar Chofer</Tooltip>}>
                                                <a type="button" onClick={() => openEditModal(item)}><i className="fas fa-user-edit fa-lg" style={{ marginRight: '5px' }}></i>{item.vNombreAfc}
                                                </a>
                                            </OverlayTrigger>
                                        </td>
                                        <td style={{ padding: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.vNumlicenciaAfc}</td>
                                        <td style={{ padding: '2px', textAlign: 'center' }}>
                                            {item.cActivoAfc === '1' ? (
                                                <i className="fas fa-check-circle fa-lg" style={{ color: 'green' }}></i>
                                            ) : (
                                                <i className="fas fa-times-circle fa-lg" style={{ color: 'red' }}></i>
                                            )}
                                        </td>
                                        <td style={{ padding: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.cLoginAfc.trim()}</td>
                                        <td style={{ padding: '2px' }}>{item.cCodigoAfc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            // Esto se mostrará si 'bandera' es falsa
                            <tbody>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        No hay datos de choferes disponibles.
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>

                <br />
                <Button variant="success" onClick={() => openModal()}>
                    <i className="fas fa-user-plus fa-lg" style={{ marginRight: '5px' }}></i> {/* Icono de añadir usuario */}
                    Registrar Chofer
                </Button>

            </div>

            {/* Modal para AGREGAR Chofer */}
            <Modal show={showModal} onHide={closeModal} size="lg" centered>
                <Modal.Header style={{ background: '#198754' }} closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Alta de Chofer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit} style={{ fontSize: '12px' }}>
                        <div className="row">
                            <div className="col-md">
                                <label htmlFor="vNombreAfc">Nombre Chofer:</label>
                                <InputGroup size="sm" className="mb-3">
                                    <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                        id="vNombreAfc" name="vNombreAfc" value={formData.vNombreAfc} onChange={handleInputChange} required />
                                </InputGroup>
                            </div>
                            {/* Columna para "Codigo de usuario" - ¡Ahora solo ocupa 3 de 12 columnas! */}
                            <div className="col-md-3"> {/* Utiliza col-md-X para definir el ancho en pantallas medianas y grandes */}
                                <label htmlFor="cLoginAfc">Codigo de usuario:</label>
                                <InputGroup size="sm" className="mb-3">
                                    <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                        id="cLoginAfc" name="cLoginAfc" value={formData.cLoginAfc} onChange={handleInputChange} required />
                                </InputGroup>
                            </div>
                            <div className="col-md">
                                <label htmlFor="vNumlicenciaAfc">Licencia:</label>
                                {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                <InputGroup size="sm" className="mb-3">
                                    <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                        id="vNumlicenciaAfc" name="vNumlicenciaAfc" value={formData.vNumlicenciaAfc} onChange={handleInputChange} required />
                                </InputGroup>
                            </div>
                        </div>

                        <div className="row">
                            {/* <div className="col">
                                <label htmlFor="cCodigoAfc">Código AF:</label>
                                <InputGroup size="sm" className="mb-3">
                                    <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== '.') {
                                                e.preventDefault();
                                            }
                                        }}
                                        id="cCodigoAfc" name="cCodigoAfc" value={formData.cCodigoAfc} onChange={handleInputChange} required />
                                </InputGroup>
                            </div> */}
                            <div className="col">
                                <label htmlFor="cTipolicenciaAfc">Tipo de licencia:</label>
                                {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                <Form.Select size="sm" className="mb-3" type="text" id="cTipolicenciaAfc" name="cTipolicenciaAfc" value={formData.cTipolicenciaAfc} onChange={handleInputChange} required>
                                    <option value="" disabled>Elige una opción</option>
                                    <option value="1">Automovilista</option>
                                    <option value="2">Chofer</option>
                                    <option value="3">Federal</option>
                                </Form.Select>
                            </div>
                            <div className="col">
                                <label htmlFor="dValidaAfc">Valida:</label>
                                {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                <InputGroup size="sm" className="mb-3">
                                    <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="date"
                                        id="dValidaAfc" name="dValidaAfc" value={formData.dValidaAfc} onChange={handleInputChange} required />
                                </InputGroup>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <Form.Check type="switch" id="custom-switch" label="Chofer Activo" name="cActivoAfc" value={formData.cActivoAfc} onChange={handleInputChange} checked disabled />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => closeModal()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Modal para EDITAR Chofer */}
            <Modal show={showEditModal} onHide={closeEditModal} size="lg" centered>
                <Modal.Header style={{ background: '#198754' }} closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Editar Chofer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Aquí iría el formulario de edición de chofer */}
                    {selectedChofer ? ( // Solo muestra el contenido si hay un chofer seleccionado
                        <div>
                            <form onSubmit={handleSubmitEdit} style={{ fontSize: '12px' }}>
                                <div className="row">
                                    <div className="col-md">
                                        <label htmlFor="vNombreAfc">Nombre Chofer:</label>
                                        <InputGroup size="sm" className="mb-3">
                                            <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                                id="vNombreAfc" name="vNombreAfc" value={formDataEdit.vNombreAfc || ''} onChange={handleInputChangeEdit} required />
                                        </InputGroup>
                                    </div>
                                    {/* Columna para "Codigo de usuario" - ¡Ahora solo ocupa 3 de 12 columnas! */}
                                    <div className="col-md-3"> {/* Utiliza col-md-X para definir el ancho en pantallas medianas y grandes */}
                                        <label htmlFor="cLoginAfc">Codigo de usuario:</label>
                                        <InputGroup size="sm" className="mb-3">
                                            <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                                id="cLoginAfc" name="cLoginAfc" value={selectedChofer.cLoginAfc.trim()} onChange={handleInputChange} required />
                                        </InputGroup>
                                    </div>
                                    <div className="col-md">
                                        <label htmlFor="vNumlicenciaAfc">Licencia:</label>
                                        {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                        <InputGroup size="sm" className="mb-3">
                                            <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="text"
                                                id="vNumlicenciaAfc" name="vNumlicenciaAfc" value={selectedChofer.vNumlicenciaAfc} onChange={handleInputChange} required />
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md">
                                        <label htmlFor="vNumlicenciaAfc">Activar o desactivar chofer:</label>
                                        <Form.Select size="sm" className="mb-3" type="text" name="cActivoAfc" value={formDataEdit.cActivoAfc} onChange={handleInputChangeEdit} required>
                                            <option value="" disabled>Elige una opción:</option>
                                            <option value="0">Desactivar</option>
                                            <option value="1">Activar</option>
                                        </Form.Select>
                                    </div>
                                    <div className="col">
                                        <label htmlFor="cTipolicenciaAfc">Tipo de licencia:</label>
                                        {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                        <Form.Select size="sm" className="mb-3" type="text" id="cTipolicenciaAfc" name="cTipolicenciaAfc" value={formDataEdit.cTipolicenciaAfc} onChange={handleInputChangeEdit} required>
                                            <option value="" disabled>Elige una opción</option>
                                            <option value="1">Automovilista</option>
                                            <option value="2">Chofer</option>
                                            <option value="3">Federal</option>
                                        </Form.Select>
                                    </div>
                                    <div className="col">
                                        <label htmlFor="dValidaAfc">Valida:</label>
                                        {/* <input type="text" className="form-control" id="tipoVehiculo" name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleInputChange} required /> */}
                                        <InputGroup size="sm" className="mb-3">
                                            <Form.Control aria-label="Small" aria-describedby="inputGroup-sizing-sm" type="date"
                                                id="dValidaAfc" name="dValidaAfc" value={formDataEdit.dValidaAfc} onChange={handleInputChangeEdit} required />
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <p>No hay chofer seleccionado para editar.</p>
                    )}
                </Modal.Body>
            </Modal>

            {/* --- Modal de Carga --- */}
            <Modal show={showLoadingModal} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center">
                    {/* <Spinner animation="border" role="status" variant="success" className="mb-3" /> */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <img
                            src={leaf_loader_slow}
                            alt="Cargando..."
                            style={{ width: '64px', height: '64px' }}
                        />
                    </div>
                    <h4>Cargando</h4>
                    <p>Por favor, espera un momento.</p>
                </Modal.Body>
            </Modal>
        </>
    )
}
