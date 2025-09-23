import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../../auth/context/AuthContext';
import dayjs from 'dayjs';
import { useForm } from '../../../hooks';
import { getActivos, getCode, getProveedor, getDepartamentos, getEmpresas, getLotesActivos, getActividadesFijasActivas, getCamposActivos, startAddNewActivoFijo, startExtrasTI, uploadPDF, getChoferes } from "../../../store/slices/combustibles";
import { Modal, Spinner, Button } from 'react-bootstrap'; // Importa los componentes de React Bootstrap para el modal
import leaf_loader_slow from '../../../../assets/leaf_loader_slow.gif';

export const AddActivo = ({ onClose, subfamilias, handleEstatusChange }) => {
    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);

    const codeResponse = useSelector(state => state.combustibles.codeResponse);
    const searchResultsProveedor = useSelector(state => state.combustibles.proveedores);
    const isLoadingProveedor = useSelector(state => state.combustibles.isLoadingProveedores);
    const proveedorError = useSelector(state => state.combustibles.errorMessageProveedores);
    const departamentos = useSelector(state => state.combustibles.departamentos);
    const isLoadingDepartamentos = useSelector(state => state.combustibles.isLoadingDepartamentos);
    const departamentosError = useSelector(state => state.combustibles.errorMessageDepartamentos);
    const empresas = useSelector(state => state.combustibles.empresas);
    const isLoadingEmpresas = useSelector(state => state.combustibles.isLoadingEmpresas);
    const empresasError = useSelector(state => state.combustibles.errorMessageEmpresas);
    //Choferes
    const choferes = useSelector(state => state.combustibles.choferes);
    const isLoadingChoferes = useSelector(state => state.combustibles.isLoadingChoferes);
    const choferesError = useSelector(state => state.combustibles.errorMessageChoferes);
    // CÓDIGO ECONÓMICO    
    const [nuevoCodigoActivo, setCodigoActivo] = useState('');
    // PROVEEDORES
    const [searchProveedor, setSearchProveedor] = useState('');
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [nombreProveedorSeleccionado, setNombreProveedorSeleccionado] = useState('');
    const [codigoProveedorSeleccionado, setCodigoProveedorSeleccionado] = useState('');
    const [mostrarListaProveedores, setMostrarListaProveedores] = useState(false);
    const [mesesDep, setMesesDep] = useState(0);
    const [esEmpresa, setEsEmpresa] = useState(false);
    const [propietarioSeleccionado, setPropietarioSeleccionado] = useState(''); // Estado para el propietario
    const [mostrarDetallesProveedor, setMostrarDetallesProveedor] = useState(false); //Estado para ocultar codigo y nombre de proveedor
    // LOTES
    const [searchLote, setSearchLote] = useState('');
    const [selectedLote, setSelectedLote] = useState(null);
    const [nombreLoteSeleccionado, setNombreLoteSeleccionado] = useState('');
    const [codigoLoteSeleccionado, setCodigoLoteSeleccionado] = useState('');
    const [nombreCultivoSeleccionado, setNombreCultivoSeleccionado] = useState('');
    const [codigoCultivoSeleccionado, setCodigoCultivoSeleccionado] = useState('');
    const [codigoCampoSeleccionado, setCodigoCampoSeleccionado] = useState('');
    const [nombreCampoSeleccionado, setNombreCampoSeleccionado] = useState('');
    const [mostrarListaLotes, setMostrarListaLotes] = useState(false);
    const [mostrarDetallesLote, setMostrarDetallesLote] = useState(false); //Estado para ocultar codigo y nombre de proveedor
    const isLoadingLote = useSelector(state => state.combustibles.isLoadingLotesActivos);
    const searchResultsLotes = useSelector(state => state.combustibles.lotesActivos);
    const loteError = useSelector(state => state.combustibles.errorMessageLotesActivos);
    //ACTIVIDADES
    const actividades = useSelector(state => state.combustibles.actividadesFijas);
    const isLoadingActividades = useSelector(state => state.combustibles.isLoadingActividadesFijas);
    const actividadesError = useSelector(state => state.combustibles.errorMessageActividadesFijas);
    //CAMPOS
    const campos = useSelector(state => state.combustibles.activosCampos);
    const isLoadingCampos = useSelector(state => state.combustibles.isLoadingCamposActivos);
    const camposError = useSelector(state => state.combustibles.errorMessageCamposActivos);
    //INSERT
    const [errorMessage, setErrorMessage] = useState('');
    //CAMPOS TI
    const [noDepreciar, setNoDepreciar] = useState(false);
    const [operativo, setOperativo] = useState(false);
    //MODAL
    const [isLoadingGuardado, setIsLoadingGuardado] = useState(false); // Nuevo estado para controlar la visibilidad del modal de carga

    const [subfamiliaSeleccionada, setSubfamiliaSeleccionada] = useState({
        codigo: '',
        nombre: '',
    });

    useEffect(() => {
        dispatch(getDepartamentos());
        dispatch(getEmpresas());
        dispatch(getActividadesFijasActivas());
        dispatch(getCamposActivos());
        dispatch(getLotesActivos());
        dispatch(getChoferes());
    }, [dispatch]);

    const handleClose = () => {
        setCodigoActivo('');
        onClose();
    };

    const handleSubfamiliaChange = (event) => {
        const selectedCodigoAff = event.target.value;

        const selectedSubfamilia = subfamilias.find(
            (subfamilia) => subfamilia.cCodigoAff === selectedCodigoAff
        );
        setSubfamiliaSeleccionada({
            codigo: selectedSubfamilia.cCodigoAff,
            nombre: selectedSubfamilia.vNombreAff,
        });
        // console.log(selectedCodigoAff);
        dispatch(getCode(selectedCodigoAff));
    };

    useEffect(() => {
        // console.log('Valor de codeResponse en useEffect:', codeResponse);
        // *** ¡ESTE ES EL ACCESO CORRECTO! ***
        // codeResponse es DIRECTAMENTE el array, así que accedemos con .[0]
        const nuevoNumeroEconomico = codeResponse?.[0]?.nuevoNumEco;
        if (nuevoNumeroEconomico) {
            // console.log('Código económico obtenido:', nuevoNumeroEconomico);
            setCodigoActivo(nuevoNumeroEconomico);
        } else {
            setCodigoActivo('');
        }
    }, [codeResponse]);

    // Reiniciar en blanco el numero económico si el modal se cierra o se guarda un activo
    useEffect(() => {
        // console.log("entre al activo");
        if (nuevoCodigoActivo.length === 0) {
            setCodigoActivo('');
        }
    }, [nuevoCodigoActivo]);

    const handleSearchProveedorChange = (event) => {
        const searchText = event.target.value;
        setSearchProveedor(searchText);
        setMostrarListaProveedores(searchText.length >= 3);
        setMostrarDetallesProveedor(false); // Ocultar los detalles al cambiar la búsqueda
        if (searchText.length >= 3) {
            dispatch(getProveedor(searchText));
        } else {
            setSelectedProveedor(null);
            setNombreProveedorSeleccionado('');
            setCodigoProveedorSeleccionado('');
        }
    };

    const handleSelectProveedor = (proveedor) => {
        setSelectedProveedor(proveedor);
        setNombreProveedorSeleccionado(proveedor.vNombreComercial);
        setCodigoProveedorSeleccionado(proveedor.vCodProveedor.trim());
        setMostrarListaProveedores(false);
        setSearchProveedor(proveedor.vNombreComercial);
        setMostrarDetallesProveedor(true); // Mostrar los detalles al seleccionar un proveedor
    };

    const checkChar = (e) => {
        if (!/[0-9A-Z.]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const onPaste = (e) => {
        e.preventDefault();
    }

    const handleInputChange = (event) => {
        setMesesDep(event.target.value);
        // setMesesDep(parseInt(event.target.value, 10) || 0);
    };
    setCodigoLoteSeleccionado, setNombreLoteSeleccionado
    setCodigoCultivoSeleccionado, setNombreCultivoSeleccionado
    setCodigoCampoSeleccionado, setNombreCampoSeleccionado
    mostrarListaLotes, setMostrarListaLotes
    mostrarDetallesLote, setMostrarDetallesLote

    const handleSearchLoteChange = (event) => {
        const searchText = event.target.value;
        setSearchLote(searchText);
        setMostrarListaLotes(searchText.length >= 3);
        setMostrarDetallesLote(false); // Ocultar los detalles al cambiar la búsqueda
        if (searchText.length >= 3) {
            dispatch(getLotesActivos(searchText));
        } else {
            setSelectedLote(null);
            setNombreLoteSeleccionado('');
            setCodigoLoteSeleccionado('');
            setNombreCultivoSeleccionado('');
            setCodigoCultivoSeleccionado('');
        }
    };

    const handleSelectLote = (lote) => {
        setSelectedLote(lote);
        setNombreLoteSeleccionado(lote.nombreLote);
        setCodigoLoteSeleccionado(lote.codigoLote.trim());
        setCodigoCultivoSeleccionado(lote.codigoCultivo);
        setNombreCultivoSeleccionado(lote.nombreCultivo.trim());
        setCodigoCultivoSeleccionado(lote.codigoCultivo);
        setNombreCultivoSeleccionado(lote.nombreCultivo.trim());
        setCodigoCampoSeleccionado(lote.codigoCampo);
        setNombreCampoSeleccionado(lote.nombreCampo.trim());
        setMostrarListaLotes(false);
        setSearchLote(lote.nombreLote);
        setMostrarDetallesLote(true); // Mostrar los detalles al seleccionar un proveedor
    };

    //Agregar archivo PDF
    const [archivoAdjunto, setArchivoAdjunto] = useState(null); // Estado para el archivo adjunto
    const [uploadStatus, setUploadStatus] = useState(''); // Estado para mensajes de subida
    const handleArchivoChange = (event) => {
        setArchivoAdjunto(event.target.files[0]);
    };

    //AGREGAR ACTIVO FIJO
    const {
        cCodigoEmp,
        cCodigoAfi,
        cNumeconAfi,
        vNombreAfi,
        cCodigoAff,
        cCodigoDep,
        cCodigoAfc,
        cCodcliPrv,
        cCodigoPrv,
        cCodigoFac,
        dAltaAfi,
        dFacturaAfi,
        dIniciadepreciaAfi,
        cTipodepreciaAfi,
        cGastosAfi,
        cEstadoAfi,
        nMontooriAfi,
        cCodigoAfs,
        cCodasePrv,
        vPolizasegAfi,
        dPolizainiciaAfi,
        dPolizavenceAfi,
        vPolizacoberturaAfi,
        vMarcaAfi,
        vModeloAfi,
        vNumserieAfi,
        vObservacionAfi,
        vPlacasAfi,
        nKmAfi,
        cCodigoLot,
        cCodigoCul,
        cCodigoAct,
        cCodigoUsu,
        dCreacionAfi,
        cUsumodAfi,
        dModifiAfi,
        cActivoAfi,
        cCodoriEmp,
        cPublicoAfi,
        cOriginalAfi,
        vPropietarioAfi,
        cEsempresaAfi,
        nMontodepAfi,
        nMesesdepAfi,
        onInputChange
    } = useForm({
        cCodigoEmp: '',
        cCodigoAfi: '',
        cNumeconAfi: '',
        vNombreAfi: '',
        cCodigoAff: '',
        cCodigoDep: '',
        cCodigoAfc: '',
        cCodcliPrv: '',
        cCodigoPrv: '',
        cCodigoFac: '',
        dAltaAfi: '',
        dFacturaAfi: '',
        dIniciadepreciaAfi: '',
        cTipodepreciaAfi: '',
        cGastosAfi: '',
        cEstadoAfi: '',
        nMontooriAfi: '',
        cCodigoAfs: '',
        cCodasePrv: '',
        vPolizasegAfi: '',
        dPolizainiciaAfi: '',
        dPolizavenceAfi: '',
        vPolizacoberturaAfi: '',
        vMarcaAfi: '',
        vModeloAfi: '',
        vNumserieAfi: '',
        vObservacionAfi: '',
        vPlacasAfi: '',
        nKmAfi: '',
        cCodigoLot: '',
        cCodigoCul: '',
        cCodigoAct: '',
        cCodigoUsu: '',
        dCreacionAfi: '',
        cUsumodAfi: '',
        dModifiAfi: '',
        cActivoAfi: '',
        cCodoriEmp: '',
        cPublicoAfi: '',
        cOriginalAfi: '',
        vPropietarioAfi: '',
        cEsempresaAfi: '',
        nMontodepAfi: '',
        nMesesdepAfi: ''
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        // console.log(nuevoCodigoActivo);
        if (
            !nuevoCodigoActivo ||
            !vNombreAfi ||
            !subfamiliaSeleccionada.nombre ||
            !cCodigoDep ||
            !cCodigoEmp ||
            !dAltaAfi ||
            !cTipodepreciaAfi ||
            !vMarcaAfi ||
            !vModeloAfi ||
            !vNumserieAfi ||
            !codigoLoteSeleccionado ||
            !codigoCultivoSeleccionado ||
            !codigoCampoSeleccionado ||
            !cCodigoAct
        ) {
            const requiredFields = [
                { value: nuevoCodigoActivo, name: 'N° económico' },
                { value: vNombreAfi, name: 'Nombre' },
                { value: subfamiliaSeleccionada.nombre, name: 'Subfamilia' },
                { value: cCodigoDep, name: 'Departamento' },
                { value: cCodigoAfc, name: 'Chofer' },
                { value: cCodigoEmp, name: 'Propietario' },
                { value: cTipodepreciaAfi, name: 'Tipo de Depreciación' },
                { value: vMarcaAfi, name: 'Marca' },
                { value: vModeloAfi, name: 'Modelo' },
                { value: vNumserieAfi, name: 'Número de Serie' },
                { value: codigoLoteSeleccionado, name: 'Código de Lote' },
                { value: codigoCultivoSeleccionado, name: 'Código de Cultivo' },
                { value: codigoCampoSeleccionado, name: 'Código de Campo' },
                { value: cCodigoAct, name: 'Código de Actividad' }
            ];

            const missingField = requiredFields.find(field => {
                // Para cadenas, verifica si es null, undefined o una cadena vacía/solo espacios
                if (typeof field.value === 'string') {
                    return !field.value || field.value.trim() === '';
                }
                // Para otros tipos (números, objetos, etc.), solo verifica si es "falsy" (null, undefined, 0, false)
                return !field.value;
            });

            if (missingField) {
                setErrorMessage(`El campo '${missingField.name}' no puede estar vacío.`);
            } else {
                // Esto es un fallback, en teoría no debería ejecutarse si el if principal es true
                setErrorMessage('Revisa que todos los campos contengan datos');
            }
            return;
        } else {
            setIsLoadingGuardado(true); // Abre el modal de carga
            const afData = {
                cCodigoEmp: cCodigoEmp || '', // Asegúrate de tener esta información del usuario
                cCodigoAfi: cCodigoAfi || '', // Asegúrate de tener esta información del usuario
                cNumeconAfi: nuevoCodigoActivo || '',
                vNombreAfi: vNombreAfi?.toUpperCase()?.trim() || '',
                cCodigoAff: subfamiliaSeleccionada.codigo || '',
                cCodigoDep: cCodigoDep || '',
                cCodcliPrv: cCodcliPrv || '',
                cCodigoAfc: cCodigoAfc || '',
                cCodigoPrv: codigoProveedorSeleccionado || '', // No hay correspondencia directa en el formulario actual
                cCodigoFac: cCodigoFac || '',
                dAltaAfi: dAltaAfi ? dayjs(dAltaAfi).format("YYYY-MM-DDTHH:mm:ss") : null,
                dFacturaAfi: dFacturaAfi ? dayjs(dFacturaAfi).format("YYYY-MM-DDTHH:mm:ss") : null,
                dIniciadepreciaAfi: dIniciadepreciaAfi ? dayjs(dIniciadepreciaAfi).format("YYYY-MM-DDTHH:mm:ss") : null,
                cTipodepreciaAfi: cTipodepreciaAfi || '', // Valor por defecto si no se selecciona
                cGastosAfi: '', // No hay correspondencia directa en el formulario actual
                cEstadoAfi: '', // Valor por defecto
                nMontooriAfi: nMontooriAfi || 0,
                cCodigoAfs: null, // No hay correspondencia directa en el formulario actual
                cCodasePrv: null, // No hay correspondencia directa en el formulario actual
                vPolizasegAfi: null, // No hay correspondencia directa en el formulario actual
                dPolizainiciaAfi: null, // No hay correspondencia directa en el formulario actual
                dPolizavenceAfi: null, // No hay correspondencia directa en el formulario actual
                vPolizacoberturaAfi: null, // No hay correspondencia directa en el formulario actual
                vMarcaAfi: vMarcaAfi || '',
                vModeloAfi: vModeloAfi || '',
                vNumserieAfi: vNumserieAfi || '',
                vObservacionAfi: vObservacionAfi || '',
                vPlacasAfi: vPlacasAfi || '',
                nKmAfi: 0, // No hay correspondencia directa en el formulario actual
                cCodigoLot: codigoLoteSeleccionado || '',
                cCodigoCul: codigoCultivoSeleccionado || '',
                cCodigoAct: cCodigoAct.trim() || '',
                cCodigoUsu: '', // Asumiendo que ti enes la información del usuario
                dCreacionAfi: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Fecha de creación actual
                cUsumodAfi: '', // Usuario que modifica
                dModifiAfi: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Fecha de modificación actual
                cActivoAfi: '1', // Activo por defecto
                cCodoriEmp: cCodigoEmp || '', // Código de empresa origen
                cPublicoAfi: null, // No público por defecto
                cOriginalAfi: null, // Original por defecto
                vPropietarioAfi: vPropietarioAfi || '',
                cEsempresaAfi: '1', // No es empresa por defecto
                nMontodepAfi: nMontodepAfi || 0,
                nMesesdepAfi: mesesDep || 0,
                cNoDepreciarAfi: noDepreciar ? "1" : "0", // Convierte el booleano a string "1" o "0"
                cOperativoAfi: operativo ? "1" : "0",
                cRutafactAfi: null,
            };

            // Agregar el archivo adjunto
            setErrorMessage('');
            let uploadSuccessful = true; // Bandera para rastrear el éxito de la subida

            if (archivoAdjunto) {
                const formDataArchivo = new FormData();
                formDataArchivo.append('archivoFactura', archivoAdjunto);
                const uploadResult = await dispatch(uploadPDF(formDataArchivo));
                if (uploadResult && uploadResult.ruta) {
                    afData.cRutafactAfi = uploadResult.ruta;
                } else {
                    setErrorMessage('Error al subir el archivo.');
                    uploadSuccessful = false;
                    setIsLoadingGuardado(false);
                }
            }

            if (uploadSuccessful) {
                const success = await dispatch(startAddNewActivoFijo(afData));
                const successExtras = await dispatch(startExtrasTI({
                    cNumeconAfi: afData.cNumeconAfi,
                    cReponsivaAti: '0'
                }));
                
                if (success && successExtras) {
                    // window.location.reload(true);
                    dispatch(getActivos()); //Solo con esto se actualiza la tabla de activos
                    setIsLoadingGuardado(false);
                    onClose();
                    handleEstatusChange(1, nuevoCodigoActivo);
                } else {
                    setErrorMessage('Error al agregar el activo fijo. Intente nuevamente.');
                    setIsLoadingGuardado(false);
                }
            }
        }
    };

    // CONST SOLO PARA VISUALIZAR EL MODAL DE CARGA, QUITAR DE COMENTARIOS EL BOTON QUE ESTA AL FINAL
    const handleGuardarClick = () => {
        setIsLoadingGuardado(true); // Abre el modal de carga al hacer clic en el botón
    };
    const [showGuardarButton, setShowGuardarButton] = useState(true);

    return (
        <>
            <style type='text/css'>
                {`/* Estilos por defecto para el popup (para pantallas grandes o el valor base) */
                    .popup {
                        max-width: 40%; /* Valor original para pantallas más grandes */
                        /* Otros estilos que ya tienes para .popup */
                        /* background-color: white; */
                        /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
                        /* width: 100%; */
                    }

                    /* Media Query para pantallas pequeñas (ej. hasta 768px, que es un tamaño de tablet/móvil) */
                    @media (max-width: 768px) {
                        .popup {
                            max-width: 90%; /* Hace el popup más ancho en pantallas pequeñas */
                            /* O si quieres que ocupe todo el ancho disponible: */
                            /* max-width: calc(100% - 40px); /* Ejemplo: 100% menos 20px de margen a cada lado */
                        }
                    }

                    /* Puedes añadir más media queries según tus necesidades */

                    /* Media Query para pantallas aún más pequeñas (ej. móviles) */
                    @media (max-width: 480px) {
                        .popup {
                            max-width: 95%; /* Incluso más ancho en móviles */
                        }
                    }

                    /* Estilos para el contenedor del popup si tienes uno */
                    .popup-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000; /* Asegura que esté por encima de otros elementos */
                    }`
                }
            </style>
            <div className="popup-container" style={{ fontSize: '12px' }}>
                <div className="rounded-4 popup" style={{ maxHeight: '60vh', overflowY: 'auto', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                        <h2>Agregar Activo Fijo</h2>
                        <button className='btn btn-danger rounded-2' onClick={handleClose}>X</button>
                    </div>
                    <div className='container'>
                        <form>
                            <div className="mb-3 row">
                                <div className="col-md-3">
                                    <label className="form-label">N° Económico *</label>
                                    <input type="text" className="form-control" name='cNumeconAfi' value={nuevoCodigoActivo} style={{ fontSize: '12px' }} readOnly disabled />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label">Nombre de Activo Fijo *</label>
                                    <input required type="text" className="form-control" name='vNombreAfi' value={vNombreAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                                <div className="col-md-4"> {/* Aumentamos el ancho para dar más espacio */}
                                    <label className="form-label">Chofer</label>
                                    <select className="form-select" name='cCodigoAfc' value={cCodigoAfc} onChange={onInputChange} style={{ fontSize: '12px' }}>
                                        <option hidden value="">Seleccionar chofer</option>
                                        {isLoadingChoferes && <option disabled>Cargando choferes...</option>}
                                        {choferesError && <option disabled className="text-danger">Error al cargar choferes</option>}
                                        {choferes.length == 0 && <option disabled className="text-danger">No hay choferes activos</option>}
                                        {choferes && choferes.map(choferes => (
                                            <option key={choferes.cCodigoAfc} value={choferes.cCodigoAfc}>
                                                {choferes.vNombreAfc}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* El codigo se necesita oculto ya que se va generar de manera automática al momento de guardar AF */}
                                {/* <div className="col-md-6" hidden>
                                <label className="form-label">Código</label>
                                <input type="text" className="form-control" name='cCodigoAfi' value={cCodigoAfi} onChange={onInputChange} />
                            </div> */}
                            </div>

                            <div className="mb-3 row align-items-center" style={{ marginTop: '-1%' }}> {/* Añadimos align-items-center para alinear verticalmente */}
                                <div className="col-md-3"> {/* Aumentamos el ancho para dar más espacio */}
                                    <label className="form-label">SubFamilia *</label>
                                    <select className="form-select" name='cCodigoAff' onChange={handleSubfamiliaChange} value={subfamiliaSeleccionada.cCodigoAff} style={{ fontSize: '12px' }}>
                                        <option hidden value="">Seleccionar</option>
                                        {subfamilias && subfamilias.map(subfamilia => (
                                            <option key={subfamilia.cCodigoAff} value={subfamilia.cCodigoAff}>
                                                {subfamilia.vNombreAff}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3"> {/* Aumentamos el ancho para dar más espacio */}
                                    <label className="form-label">Departamento *</label>
                                    <select className="form-select" name='cCodigoDep' value={cCodigoDep} onChange={onInputChange} style={{ fontSize: '12px' }}>
                                        <option hidden value="">Seleccionar</option>
                                        {isLoadingDepartamentos && <option disabled>Cargando departamentos...</option>}
                                        {departamentosError && <option disabled className="text-danger">Error al cargar departamentos</option>}
                                        {departamentos && departamentos.map(departamento => (
                                            <option key={departamento.cCodigoDep} value={departamento.cCodigoDep}>
                                                {departamento.vNombreDep}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3"> {/* Aumentamos el ancho para dar más espacio */}
                                    <label className="form-label">Propietario *</label>
                                    <select required className="form-select" name='cCodigoEmp' value={cCodigoEmp} onChange={onInputChange} style={{ fontSize: '12px' }}>
                                        <option hidden value="">Seleccionar</option>
                                        {esEmpresa ? (
                                            isLoadingEmpresas ? (
                                                <option disabled>Cargando empresas...</option>
                                            ) : empresasError ? (
                                                <option disabled className="text-danger">Error al cargar empresas</option>
                                            ) : (
                                                empresas && empresas.map(empresa => (
                                                    <option key={empresa.cCodigoEmp} value={empresa.cCodigoEmp}>
                                                        {empresa.cCodigoEmp} {empresa.vNombrcortEmp}
                                                    </option>
                                                ))
                                            )
                                        ) : (
                                            <option disabled>Marcar empresa si AF pertenece a Agroberries MX</option>
                                        )}
                                    </select>
                                    {/* <div className="form-text">Marcar empresa para habilitar opciones.</div> */}
                                </div>
                                <div className="col-md-3 d-flex align-items-center"> {/* Usamos d-flex y align-items-center para alinear el checkbox y la etiqueta */}
                                    <div className="mb-3 form-check m-0"> {/* Eliminamos el margen inferior del div interno */}
                                        <input type="checkbox" className="form-check-input" id="empresa" name='cEsempresaAfi' checked={esEmpresa}
                                            onChange={(e) => {
                                                setEsEmpresa(e.target.checked);
                                                setPropietarioSeleccionado('');
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor="empresa">Empresa</label>
                                    </div>
                                </div>
                            </div>

                            {/* {!esEmpresa && (
                            <> */}
                            <div className="mb-3">
                                <label className="form-label" style={{ background: '#00d581', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                    Proveedor
                                </label>
                                <input type="text" className="form-control" placeholder="Buscar nombre proveedor..." value={searchProveedor} onChange={handleSearchProveedorChange} style={{ fontSize: '12px' }} />
                                {isLoadingProveedor && <div className="form-text">Buscando proveedores...</div>}
                                {mostrarListaProveedores && searchResultsProveedor.length > 0 && (
                                    <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
                                        {searchResultsProveedor.map(proveedor => (
                                            <li
                                                key={proveedor.vCodProveedor}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => handleSelectProveedor(proveedor)}
                                            >
                                                {proveedor.vNombreComercial}
                                                <small className="text-muted"> - RFC: {proveedor.vCodProveedor && proveedor.vCodProveedor.trim()}</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {proveedorError && <div className="form-text text-danger">{proveedorError}</div>}
                            </div>

                            {mostrarDetallesProveedor && (
                                <div className="mb-3 row">
                                    <div className="col-md-6">
                                        <label className="form-label">Código Proveedor</label>
                                        <input type="text" className="form-control" name='cCodcliPrv' value={codigoProveedorSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre Proveedor</label>
                                        <input type="text" className="form-control" value={nombreProveedorSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                </div>
                            )}
                            {/* </>)} */}

                            <label className="form-label" style={{ background: '#00d581', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Factura
                            </label>
                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Nº Factura</label>
                                    <input type="text" className="form-control" name='cCodigoFac' value={cCodigoFac} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">F. Factura</label>
                                    <input type="date" className="form-control" name='dFacturaAfi' value={dFacturaAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Importe Acumulado Ext.</label>
                                    <input type="number" className="form-control" min="0" style={{ fontSize: '12px' }} onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== '.') {
                                            e.preventDefault();
                                        }
                                    }}
                                        onPaste={(e) => {
                                            const pastedData = e.clipboardData.getData('text');
                                            if (/[^0-9]/.test(pastedData)) {
                                                e.preventDefault();
                                            }
                                        }} name='nMontooriAfi' value={nMontooriAfi} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">F. Alta *</label>
                                    <input required type="date" className="form-control" name='dAltaAfi' value={dAltaAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                            </div>

                            <label className="form-label" style={{ background: '#00d581', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                Depreciación y datos de Activo Fijo
                            </label>
                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Nº Meses Depreciación</label>
                                    <input required type="number" className="form-control" aria-describedby="emailHelp" min="0" step="1"
                                        name='nMesesdepAfi' value={mesesDep} // Ahora está controlado por el estado
                                        onChange={handleInputChange} // Actualiza el estado al cambiar
                                        onKeyDown={(e) => checkChar(e)}
                                        onPaste={onPaste}
                                        style={{ fontSize: '12px' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Fecha Inicial de Depreciación</label>
                                    <input type="date" className="form-control" name='dIniciadepreciaAfi' value={dIniciadepreciaAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Tipo Depreciación *</label>
                                    <select className="form-select" name='cTipodepreciaAfi' value={cTipodepreciaAfi} onChange={onInputChange} style={{ fontSize: '12px' }}>
                                        <option hidden value="">Seleccionar</option>
                                        <option value="1">Normal</option>
                                        <option value="2">Acelerada</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Precio Compra</label>
                                    <input required type="number" className="form-control" min="0" style={{ fontSize: '12px' }} onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== '.') {
                                            e.preventDefault();
                                        }
                                    }}
                                        onPaste={(e) => {
                                            const pastedData = e.clipboardData.getData('text');
                                            if (/[^0-9]/.test(pastedData)) {
                                                e.preventDefault();
                                            }
                                        }} name='nMontodepAfi' value={nMontodepAfi} onChange={onInputChange} />
                                </div>
                            </div>

                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Marca *</label>
                                    <input type="text" className="form-control" name='vMarcaAfi' value={vMarcaAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Modelo *</label>
                                    <input type="text" className="form-control" name='vModeloAfi' value={vModeloAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                            </div>

                            <div className="mb-3 row">
                                <div className="col-md-6">
                                    <label className="form-label">Nº Serie *</label>
                                    <input type="text" className="form-control" name='vNumserieAfi' value={vNumserieAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Placas</label>
                                    <input required type="text" className="form-control" name='vPlacasAfi' value={vPlacasAfi} onChange={onInputChange} style={{ fontSize: '12px' }} />
                                    <div className="form-text">Evitar el caracter "-" al ingresar las placas del vehiculo.</div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ background: '#00d581', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                    Centro de Costo
                                </label>
                                <div className="col-md-6">
                                    <label className="form-label">Lote *</label>
                                    <select
                                        className="form-select"
                                        value={codigoLoteSeleccionado}
                                        onChange={(e) => {
                                            const selectedCodigo = e.target.value;
                                            const loteSeleccionado = searchResultsLotes.find(l => l.codigoLote === selectedCodigo);
                                            if (loteSeleccionado) {
                                                handleSelectLote(loteSeleccionado);
                                            }
                                        }}
                                        style={{ fontSize: '12px' }}
                                    >
                                        <option hidden value="">Seleccionar</option>
                                        {isLoadingLote && <option disabled>Cargando lotes...</option>}
                                        {loteError && <option disabled className="text-danger">Error al cargar lotes</option>}
                                        {searchResultsLotes && searchResultsLotes.map(lote => (
                                            <option key={lote.codigoLote} value={lote.codigoLote}>
                                                {lote.nombreLote}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar nombre lote..."
                                value={searchLote}
                                onChange={handleSearchLoteChange}
                            />
                            {isLoadingLote && <div className="form-text">Buscando Lotes...</div>}
                            {mostrarListaLotes && searchResultsLotes.length > 0 && (
                                <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}>
                                    {searchResultsLotes.map(lote => (
                                        <li
                                            key={lote.codigoLote}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => handleSelectLote(lote)}
                                        >
                                            {lote.codigoLote}
                                            <small className="text-muted"> - {lote.nombreLote.trim()}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {loteError && <div className="form-text text-danger">{loteError}</div>} */}
                            </div>

                            {mostrarDetallesLote && (
                                <div className="mb-3 row">
                                    <div className="col-md-2"> {/* Ajustamos el ancho de cada columna */}
                                        <label className="form-label">Código Lote</label>
                                        <input type="text" className="form-control" name='cCodigoLot' value={codigoLoteSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Nombre Lote</label>
                                        <input type="text" className="form-control" value={nombreLoteSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Código Cultivo</label>
                                        <input type="text" className="form-control" name='cCodigoCul' value={codigoCultivoSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">Nombre Cultivo</label>
                                        <input type="text" className="form-control" value={nombreCultivoSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                    </div>
                                    <div className="mb-3 row" style={{ marginTop: '1%' }}>
                                        <div className="col-md-2">
                                            <label className="form-label">Código Campo</label>
                                            <input type="text" className="form-control" name='cCodigoCam' value={codigoCampoSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                        </div>
                                        <div className="col-md-5">
                                            <label className="form-label">Nombre Campo</label>
                                            <input type="text" className="form-control" value={nombreCampoSeleccionado} style={{ fontSize: '12px' }} readOnly disabled />
                                        </div>
                                        <div className="col-md-5"> {/* Aumentamos el ancho para dar más espacio */}
                                            <label className="form-label">Actividad *</label>
                                            <select className="form-select" name='cCodigoAct' value={cCodigoAct} onChange={onInputChange} style={{ fontSize: '12px' }}>
                                                <option hidden value="">Seleccionar</option>
                                                {isLoadingActividades && <option disabled>Cargando actividades...</option>}
                                                {actividadesError && <option disabled className="text-danger">Error al cargar actividades</option>}
                                                {actividades && actividades.map(actividades => (
                                                    <option key={actividades.cCodigoAct} value={actividades.cCodigoAct}>
                                                        {actividades.vNombreAct}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* <div className="mb-3 row">
                            <div className="col-md-6">
                                <label className="form-label">Campo</label>
                                <select className="form-select" name='cCodigoCam' value={cCodigoCam} onChange={onInputChange}>
                                    <option hidden value="">Seleccionar</option>
                                    {isLoadingCampos && <option disabled>Cargando actividades...</option>}
                                    {camposError && <option disabled className="text-danger">Error al cargar actividades</option>}
                                    {campos && campos.map(campos => (
                                        <option key={campos.cCodigoCam} value={campos.cCodigoCam}>
                                            {campos.cCodigoCam}-{campos.vNombreCam}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div> */}
                            <div className="mb-3">
                                <label className="form-label">Observación</label>
                                <textarea className="form-control" name='vObservacionAfi' value={vObservacionAfi} onChange={onInputChange} maxLength={250} style={{ fontSize: '12px' }}></textarea>
                                <div className="form-text">Máximo 250 caracteres.</div>
                            </div>

                            <div className='mb-3'>
                                <label className="form-label" style={{ background: '#00d581', color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', width: '100%', marginBottom: '1%', paddingLeft: '10px' }}>
                                    Activo operativo
                                </label>
                                <div className="row align-items-center"> {/* Usamos 'row' para controlar el layout horizontal */}
                                    <div className="col-md-auto"> {/* 'col-md-auto' ajusta el ancho al contenido */}
                                        <div className="form-check m-0 me-3">
                                            <input type="checkbox" className="form-check-input" id="noDepreciar" checked={noDepreciar} onChange={(e) => setNoDepreciar(e.target.checked)} value={noDepreciar ? 1 : 0} />
                                            <label className="form-check-label" htmlFor="noDepreciar">No depreciar</label>
                                        </div>
                                    </div>
                                    <div className="col-md-auto"> {/* 'col-md-auto' ajusta el ancho al contenido */}
                                        <div className="form-check m-0 me-3">
                                            <input type="checkbox" className="form-check-input" id="operativo" checked={operativo} onChange={(e) => setOperativo(e.target.checked)} value={operativo ? 1 : 0} />
                                            <label className="form-check-label" htmlFor="operativo">Operativo</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="archivoFactura" className="form-label me-2">Archivo Factura:</label>
                                        <input type="file" className="form-control" id="archivoFactura" onChange={handleArchivoChange} style={{ fontSize: '12px' }} />
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

                    <div className='container mb-1 mt-2'>
                        <button className='btn btn-success rounded-2 m-1' onClick={onSubmit}>Guardar</button>
                        <button className='btn btn-danger rounded-2 m-1' onClick={handleClose}>Cerrar</button>
                        {/* <Button type="button" onClick={handleGuardarClick}>
                            Guardar Activo Fijo
                        </Button> */}
                    </div>
                </div>
            </div>
            {/* MODAL DE CARGA AL INSERTAR */}
            <Modal show={isLoadingGuardado} centered>
                <Modal.Body className="text-center">
                    {/* <Spinner animation="border" role="status" className="mb-2" /> */}
                    <img src={leaf_loader_slow} alt="Cargando..." style={{ width: '64px', height: '64px' }} />
                    <p>Guardando activo fijo...</p>
                </Modal.Body>
            </Modal>
        </>
    );
}