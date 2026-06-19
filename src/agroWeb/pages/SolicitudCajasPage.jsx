import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { addRegistro, removeRegistro, clearRegistros, setCatalogos, updateRegistroState } from '../../store/slices/cajas/solicitudCajasSlice';
import { startGuardarSolicitud, startActualizarSolicitud } from '../../store/slices/cajas/thunks';
import { agregarSolicitudCajas } from '../../sqlserver/cajasCRUD';
import { AuthContext } from '../../auth/context/AuthContext';
import '../../css/cajas.css';

// === COLOCA EL OBJETO AQUÍ (AFUERA Y ARRIBA DE TODO) ===
const styles = {
    selectBase: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #d1c7bd',
        backgroundColor: '#ffffff',
        fontSize: '14px',
        color: '#2d1f3d',
        outline: 'none',
        width: '100%',
        height: '42px',
        transition: 'all 0.2s'
    },
    inputBase: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #d1c7bd',
        backgroundColor: '#ffffff',
        fontSize: '14px',
        color: '#2d1f3d',
        outline: 'none',
        width: '100%',
        height: '42px',
        transition: 'all 0.2s'
    },
    readOnlyBase: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e1dbe9',
        backgroundColor: '#f9f8fa',
        fontSize: '14px',
        color: '#6b5b7b',
        outline: 'none',
        fontWeight: '500',
        width: '100%',
        height: '42px',
        cursor: 'not-allowed'
    },
    btnBase: {
        flex: 1,
        height: '42px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(124, 48, 184, 0.08)',
        transition: 'all 0.2s',
        width: '100%'
    }
};

export const SolicitudCajasPage = () => {

    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);
    const { registros, coolers, tamanios, campos, SKUs } = useSelector(state => state.solicitudCajas);

    // Estado local para los registros que ya viven de forma permanente en SQL Server
    const [solicitudesGuardadas, setSolicitudesGuardadas] = useState([]);

    // Función aislada para consultar y refrescar las solicitudes guardadas de hoy
    const cargarSolicitudesHoy = async () => {
        try {
            const guardadas = await agregarSolicitudCajas.getSolicitudesHoy();
            setSolicitudesGuardadas(guardadas || []);
        } catch (error) {
            console.error("Error al cargar solicitudes de hoy:", error);
        }
    };

    const [formData, setFormData] = useState({
        cooler: '',
        campo: '',
        cCodigoCam: '',
        cCodigoCul: '',
        cliente: '',
        sku: '',
        variedad: '',
        embalaje: '',
        cajas: '',
        fecha: ''
    });

    const [registroEnEdicion, setRegistroEnEdicion] = useState(null);

    // Calcular tamaños filtrados basado en el cultivo seleccionado
    const tamaniosFiltrados = formData.cCodigoCul
        ? tamanios.filter(t => t.c_codigo_cul === formData.cCodigoCul)
        : tamanios;

    // useEffect de carga inicial para catálogos y solicitudes del día
    useEffect(() => {
        const fetchCatalogos = async () => {
            const [dataCoolers, dataTamanios, dataCampos, dataSKUs] = await Promise.all([
                agregarSolicitudCajas.getCoolers(),
                agregarSolicitudCajas.getTamanios(),
                agregarSolicitudCajas.getCamposSectores(),
                agregarSolicitudCajas.getSKUs()
            ]);
            dispatch(setCatalogos({
                coolers: dataCoolers,
                tamanios: dataTamanios,
                campos: dataCampos,
                SKUs: dataSKUs
            }));

            // Cargamos las solicitudes guardadas de hoy en la base de datos al arrancar
            await cargarSolicitudesHoy();
        };
        fetchCatalogos();
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "campo") {
            const [codigoCam, codigoCul] = value.split('|');
            setFormData(prev => ({
                ...prev,
                campo: value,
                cCodigoCam: codigoCam,
                cCodigoCul: codigoCul,
                sku: '',
                cliente: '',
                variedad: '',
                embalaje: ''
            }));
        } else if (name === "cooler") {
            setFormData(prev => ({
                ...prev,
                cooler: value,
                campo: '',
                cCodigoCam: '',
                cCodigoCul: '',
                sku: '',
                cliente: '',
                variedad: '',
                embalaje: ''
            }));
        } else if (name === "sku") {
            // Buscamos los datos extendidos del SKU en el catálogo maestro
            const skuEncontrado = SKUs.find(s => s.codigo === value);
            if (skuEncontrado) {
                setFormData(prev => ({
                    ...prev,
                    sku: value,
                    cliente: skuEncontrado.cliente,
                    variedad: skuEncontrado.variedad,
                    embalaje: skuEncontrado.embalaje
                }));
            } else {
                setFormData(prev => ({ ...prev, sku: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAgregarRegistro = async (e) => {
        e.preventDefault();

        if (!formData.cooler || !formData.cliente || !formData.sku || !formData.cajas) {
            Swal.fire('Error', 'Por favor completa los campos obligatorios', 'error');
            return;
        }

        // SI ESTAMOS EN MODO EDICIÓN
        if (registroEnEdicion) {
            const esRegistroGuardadoEnBD = typeof registroEnEdicion === 'number' && registroEnEdicion < 9999999999;

            if (esRegistroGuardadoEnBD) {
                // CASO A: El registro ya pertenece a SQL Server (Persistente)
                const datosActualizados = {
                    ...formData,
                    usuario: user?.id || 'Usuario'
                };

                const exito = await dispatch(startActualizarSolicitud(registroEnEdicion, datosActualizados));

                if (exito) {
                    Swal.fire('¡Actualizado!', 'El registro en la base de datos ha sido modificado.', 'success');
                    await cargarSolicitudesHoy();
                    setRegistroEnEdicion(null);

                    // Al terminar de editar, sí limpiamos el formulario para salir de ese estado
                    setFormData({
                        cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
                        cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
                    });
                } else {
                    Swal.fire('Error', 'No se pudo actualizar el registro en el servidor.', 'error');
                    return;
                }
            } else {
                // CASO B: El registro sólo vive en la tabla temporal (Frontend)
                const registroActualizado = {
                    id: registroEnEdicion,
                    ...formData,
                    cajas: parseInt(formData.cajas)
                };
                dispatch(removeRegistro(registroEnEdicion));
                dispatch(addRegistro(registroActualizado));
                setRegistroEnEdicion(null);

                // Al terminar de editar, sí limpiamos el formulario para salir de ese estado
                setFormData({
                    cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
                    cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
                });
            }

        } else {
            // MODO INSERCIÓN NORMAL (Temporal en tabla de arriba)
            const nuevoRegistro = {
                id: Date.now(),
                fecha: formData.fecha,
                ...formData,
                cajas: parseInt(formData.cajas),
                usuario: user?.id || 'Usuario',
                fechaCreacion: new Date().toLocaleString('es-ES')
            };
            dispatch(addRegistro(nuevoRegistro));

            // YA NO SE LIMPIA AQUÍ EL FORMULARIO. Los datos se quedan en la pantalla para tu siguiente registro.
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    Swal.fire('Error', 'El archivo Excel está vacío', 'error');
                    return;
                }

                const primerRegistro = data[0];
                const columnaCampo = primerRegistro.hasOwnProperty('campo') ? 'campo' : 'cCodigoCam';
                const columnasNecesarias = ['cooler', columnaCampo, 'sku', 'cajas', 'fecha'];
                const tieneColumnas = columnasNecesarias.every(col => primerRegistro.hasOwnProperty(col));

                if (!tieneColumnas) {
                    Swal.fire('Error', 'El archivo no tiene el formato correcto o faltan columnas esenciales.', 'error');
                    return;
                }

                // Función avanzada para limpiar y normalizar textos
                const normalizar = (txt) => {
                    return String(txt || '')
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "") // Quita acentos
                        .toLowerCase()
                        .trim();
                };

                // Función de búsqueda avanzada por coincidencia de palabras (Estilo LIKE inteligente)
                const buscarCoincidenciaInteligente = (textoExcel, catalogo, propiedadNombre) => {
                    const textoLimpio = normalizar(textoExcel);
                    if (!textoLimpio) return null;

                    const coincidenciaDirecta = catalogo.find(item => {
                        const nombreCat = normalizar(item[propiedadNombre]);
                        return nombreCat === textoLimpio || nombreCat.includes(textoLimpio) || textoLimpio.includes(nombreCat);
                    });
                    if (coincidenciaDirecta) return coincidenciaDirecta;

                    const palabrasExcel = textoLimpio.split(/\s+/).filter(p => p.length > 2);

                    let mejorMatch = null;
                    let maxCoincidencias = 0;

                    catalogo.forEach(item => {
                        const nombreCat = normalizar(item[propiedadNombre]);
                        const coincidencias = palabrasExcel.filter(palabra => nombreCat.includes(palabra)).length;

                        if (coincidencias > maxCoincidencias) {
                            maxCoincidencias = coincidencias;
                            mejorMatch = item;
                        }
                    });

                    return maxCoincidencias > 0 ? mejorMatch : null;
                };

                // Variable bandera para saber si hubo errores en el archivo entero
                let tieneErroresDeCultivo = false;

                data.forEach((row, index) => {
                    // Si ya detectamos un error en una fila anterior, saltamos el resto
                    if (tieneErroresDeCultivo) return;

                    const skuFormateado = String(row.sku || '').trim();

                    // 1. BUSCAR COOLER
                    let coolerCodigo = String(row.cooler || '').trim().padStart(4, '0');
                    const coolerEncontrado = buscarCoincidenciaInteligente(row.cooler, coolers, 'v_nombre_cam');
                    if (coolerEncontrado) {
                        coolerCodigo = coolerEncontrado.c_codigo_cam;
                    }

                    // 2. BUSCAR CAMPO Y CULTIVO
                    let campoCodigo = String(row[columnaCampo] || '').trim().padStart(4, '0');
                    let cultivoCodigo = String(row.cCodigoCul || '').trim();

                    const campoEncontrado = buscarCoincidenciaInteligente(row[columnaCampo], campos, 'vNombreCam');
                    if (campoEncontrado) {
                        campoCodigo = campoEncontrado.cCodigoCam;
                        cultivoCodigo = campoEncontrado.cCodigoCul;
                    }

                    // 3. EXCELENTE: Usamos 'tamanios' para amarrar la validación matemática del cultivo
                    const tamanioEncontrado = tamanios.find(s => s.c_codigo_tam === skuFormateado);

                    // 4. NUEVO: Recuperamos la metadata comercial desde tu catálogo original 'SKUs'
                    const infoSkuComercial = SKUs.find(s => s.codigo === skuFormateado);

                    // =========================================================================
                    // VALIDACIÓN DE COMPATIBILIDAD POR CÓDIGO DE CULTIVO EXACTO
                    // =========================================================================
                    if (campoEncontrado && tamanioEncontrado) {
                        const cultivoCampo = String(campoEncontrado.cCodigoCul || '').trim();
                        const cultivoSku = String(tamanioEncontrado.c_codigo_cul || '').trim();

                        if (cultivoSku && cultivoCampo && cultivoSku !== cultivoCampo) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Incompatibilidad de Cultivo',
                                text: `Línea ${index + 2} del Excel: El SKU "${skuFormateado}" no pertenece al cultivo del campo "${campoEncontrado.vNombreCam}".`,
                            });
                            tieneErroresDeCultivo = true;
                            return;
                        }
                    }
                    // =========================================================================

                    const nuevoRegistro = {
                        id: Date.now() + index + Math.random(),
                        fecha: row.fecha,
                        cooler: coolerCodigo,
                        cCodigoCam: campoCodigo,
                        cCodigoCul: cultivoCodigo,
                        campo: `${campoCodigo}|${cultivoCodigo}`,
                        sku: skuFormateado,
                        // Aquí usamos infoSkuComercial para recuperar las etiquetas correctas que se rompieron
                        cliente: infoSkuComercial ? infoSkuComercial.cliente : (row.cliente ? String(row.cliente).trim() : 'N/A'),
                        variedad: infoSkuComercial ? infoSkuComercial.variedad : (row.variedad ? String(row.variedad).trim() : 'N/A'),
                        embalaje: infoSkuComercial ? infoSkuComercial.embalaje : (row.embalaje ? String(row.embalaje).trim() : 'N/A'),
                        cajas: parseInt(row.cajas) || 0,
                        usuario: user?.id || 'Usuario',
                        fechaCreacion: new Date().toLocaleString('es-ES')
                    };
                    dispatch(addRegistro(nuevoRegistro));
                });

                // Si se interrumpió por error, limpiamos el input y no mandamos mensaje de éxito
                if (tieneErroresDeCultivo) {
                    e.target.value = null;
                    return;
                }

                setMostrarFormulario(true);

                Swal.fire('¡Éxito!', `Se importaron ${data.length} líneas desde el archivo Excel.`, 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un error al procesar el archivo Excel.', 'error');
            }
            e.target.value = null;
        };
        reader.readAsBinaryString(file);
    };

    const descargarPlantilla = () => {
        // 1. Quitamos la comilla simple del SKU, dejamos el texto limpio
        const plantilla = [{
            fecha: "2026-06-11",
            cooler: "COOLER LAGOS",
            campo: "LAGOS DE MORENO ZARZAMORA",
            sku: "005003",
            cajas: 350
        }];

        // Generamos la hoja de forma normal
        const ws = XLSX.utils.json_to_sheet(plantilla);

        // 2. Formateamos TODA la columna del SKU (Columna D) para que Excel la trate como Texto
        // Recorremos desde la fila 2 (D2) hasta la fila 200 por si quieren escribir hacia abajo
        for (let i = 2; i <= 200; i++) {
            const cellRef = `D${i}`; // La columna D es el SKU (fecha=A, cooler=B, campo=C, sku=D)

            if (!ws[cellRef]) {
                ws[cellRef] = {}; // Si la celda está vacía, la inicializamos
            }

            ws[cellRef].t = 's';  // Fuerza a que el tipo de dato sea String ('s')
            ws[cellRef].z = '@';  // Aplica el formato explícito de Texto en Excel para retener ceros
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Solicitudes");
        XLSX.writeFile(wb, "Plantilla_Carga_Solicitudes.xlsx");
    };

    const handleEditarRegistro = (registro) => {
        setFormData({
            cooler: registro.cooler,
            campo: registro.campo,
            cCodigoCam: registro.cCodigoCam,
            cCodigoCul: registro.cCodigoCul,
            cliente: registro.cliente,
            sku: registro.sku,
            variedad: registro.variedad,
            embalaje: registro.embalaje,
            cajas: registro.cajas,
            fecha: registro.fecha
        });
        setRegistroEnEdicion(registro.id);
    };

    const handleCancelarEdicion = () => {
        setRegistroEnEdicion(null);
        setFormData({
            cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
            cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
        });
    };

    const handleGuardar = async () => {
        if (registros.length === 0) {
            Swal.fire('Atención', 'No hay registros para guardar', 'warning');
            return;
        }

        const datosParaGuardar = registros.map(reg => ({
            iIdSolicitudCaj: 0,
            vCodcoolerCaj: reg.cooler,
            vCodcampoCaj: reg.cCodigoCam,
            vCodcultivoCaj: reg.cCodigoCul,
            vClienteCaj: reg.cliente,
            vSkuCaj: reg.sku,
            vVariedadCaj: reg.variedad,
            vEmbalajeCaj: reg.embalaje,
            iCajasCaj: reg.cajas,
            vUsuarioCaj: user?.id || 'Usuario',
            dFechaCaj: reg.fecha.includes("T") ? reg.fecha : `${reg.fecha}T00:00:00.000Z`,
            dFechacreacionCaj: new Date().toISOString()
        }));

        const result = await Swal.fire({
            title: 'Confirmar solicitud',
            text: `¿Estás seguro de enviar estas ${registros.length} líneas de solicitud de cajas?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c30b8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar'
        });

        if (result.isConfirmed) {
            const exito = await dispatch(startGuardarSolicitud(datosParaGuardar));
            if (exito) {
                Swal.fire('¡Éxito!', 'Solicitud guardada correctamente en la base de datos', 'success');
                setFormData({
                    cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
                    cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
                });
                dispatch(clearRegistros());
                await cargarSolicitudesHoy(); // <-- CORRECCIÓN: Al guardar, la tabla de abajo se actualiza inmediatamente
            } else {
                Swal.fire('Error', 'Hubo un problema al guardar la solicitud en el servidor', 'error');
            }
        }
    };

    const totalCajas = registros.reduce((sum, reg) => sum + reg.cajas, 0);

    const RELACION_COOLER_CAMPOS = {
        "0059": ["camichines", "refugio", "peña", "ignacio", "terrazas"],       // COOLER TALA
        "0060": ["fuerte"],       // COOLER EL FUERTE
        "0061": ["mochicahui"],       // COOLER MOCHIS
        "0062": ["briseño",],       // COOLER ZACOALCO
        "0063": ["verde", "anima"],       // COOLER USMAJAC
        "0064": ["lagos"],       // COOLER LAGOS
        "0074": [""],       // COOLER GLOBAL
        // Puedes seguir agregando los coolers que te hagan falta aquí abajo:
    };

    // Calcular campos filtrados basado en el cooler seleccionado
    const camposFiltrados = useMemo(() => {
        if (!formData.cooler || !RELACION_COOLER_CAMPOS[formData.cooler]) {
            return campos; // Si no hay cooler seleccionado o no tiene reglas, muestra todos
        }

        const palabrasClave = RELACION_COOLER_CAMPOS[formData.cooler];

        return campos.filter(campo => {
            // Normalizamos quitando acentos, pero PROTEGIENDO la Ñ/ñ
            const nombreCampoNormalizado = campo.vNombreCam
                .toLowerCase()
                .normalize("NFD")
                // Este regex elimina acentos comunes pero no toca la tilde de la eñe
                .replace(/([^n\u0303])[\u0300-\u036f]/g, "$1")
                .normalize("NFC");

            // Ahora sí buscará "peña" dentro de "la peña - zarzamora"
            return palabrasClave.some(palabra => nombreCampoNormalizado.includes(palabra));
        });
    }, [formData.cooler, campos]);

    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        // Capturamos el archivo arrastrado
        const file = e.dataTransfer.files[0];

        if (file) {
            // Validamos que sea un archivo de Excel
            const tipoArchivo = file.name.split('.').pop().toLowerCase();
            if (tipoArchivo !== 'xlsx' && tipoArchivo !== 'xls') {
                Swal.fire('Error', 'Por favor, arrastra únicamente archivos de Excel (.xlsx o .xls)', 'error');
                return;
            }

            // Creamos un evento falso con la misma estructura que esperaba tu input file original
            const falsoEvento = { target: { files: [file], value: null } };
            handleFileUpload(falsoEvento);
        }
    };

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Filtra los SKUs en tiempo real basándose en lo que el usuario escribe en el input
    const tamaniosBusquedaFiltrados = useMemo(() => {
        // Si no hay un cultivo seleccionado, no mostramos nada
        if (!formData.cCodigoCul) return [];

        // Si el input está vacío, mostramos todas las opciones permitidas para ese cultivo
        if (!formData.sku) return tamaniosFiltrados;

        const busqueda = formData.sku.toLowerCase().trim();

        return tamaniosFiltrados.filter(t => {
            const codigo = (t.c_codigo_tam || '').toLowerCase();
            const nombre = (t.v_nombre_tam || '').toLowerCase();

            // El SKU pasa el filtro si coincide con el código O con el nombre descriptivo
            return codigo.includes(busqueda) || nombre.includes(busqueda);
        });
    }, [formData.sku, formData.cCodigoCul, tamaniosFiltrados]);

    return (
        <>
            <br /> <br />
            <div id="pagesContainer" className="container-fluid rounded-3 p-4 mt-2 animate__animated animate__fadeIn" style={{ background: 'white', marginBottom: '40px' }}>
                <div className="rounded-3 shadow-sm mb-4" style={{ background: '#7c30b8', color: 'white', padding: '8px 12px', textAlign: 'center' }}>
                    <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>SOLICITUD DE CAJAS</h5>
                </div>

                {/* Sección de Carga Externa desde Archivos de Excel */}
                <div className="mb-4 p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <span className="fw-bold text-secondary d-block">Carga masiva de registros</span>
                            <small className="text-muted">Descarga la plantilla oficial, llena las celdas y súbela al sistema.</small>
                        </div>
                        <div className="d-flex gap-2">
                            {/* <label className="btn btn-success m-0" style={{ cursor: 'pointer', background: '#1f8047', borderColor: '#1f8047' }}>
                                <i className="fas fa-file-excel me-2"></i> Importar Excel
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label> */}

                            <button className="btn" type="button"
                                onClick={() => {
                                    // 1. Calculamos cuál será el siguiente estado
                                    const proximoEstado = !mostrarFormulario;

                                    // 2. Cambiamos la visibilidad del formulario
                                    setMostrarFormulario(proximoEstado);

                                    // 3. Si el próximo estado es TRUE (se va a mostrar), limpiamos los campos
                                    if (proximoEstado) {
                                        setFormData({
                                            cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
                                            cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
                                        });

                                        // Opcional pero recomendado: si usas un estado para controlar qué ID editas, lo limpias aquí
                                        if (typeof setRegistroEnEdicion === 'function') {
                                            setRegistroEnEdicion(null);
                                        }
                                    }
                                }}
                                style={{
                                    backgroundColor: mostrarFormulario ? '#f4ecf7' : '#7c30b8',
                                    color: mostrarFormulario ? '#7c30b8' : '#ffffff',
                                    border: '1px solid #7c30b8',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '200px',
                                    height: '42px',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                    marginBottom: '15px'
                                }}
                            >
                                <i className={mostrarFormulario ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                {mostrarFormulario ? "Ocultar Solicitud" : "Mostrar Solicitud Manual"}
                            </button>

                            <button className="btn btn-outline-secondary" type="button"
                                onClick={descargarPlantilla}
                                style={{
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center', // Centra el contenido horizontalmente
                                    minWidth: '200px',        // Ancho mínimo idéntico para ambos
                                    height: '42px',           // Altura fija idéntica para ambos
                                    gap: '8px',
                                    marginBottom: '15px'
                                }}
                            >
                                <i className="fas fa-download"></i> Obtener Plantilla
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className="zona-drop"
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true); // Se activa el color lila de fondo
                    }}
                    onDragLeave={() => setIsDragging(false)} // Vuelve a la normalidad si el usuario se arrepiente
                    onDrop={handleDrop} // Procesa el archivo al soltarlo
                    style={{
                        border: isDragging ? '2px dashed #7c30b8' : '2px dashed #b39ddb',
                        backgroundColor: isDragging ? '#f3e8ff' : '#fcfaff',
                        borderRadius: '12px',
                        padding: '10px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        margin: '20px 0'
                    }}>
                    {/* Input oculto por si prefieren hacer clic en lugar de arrastrar */}
                    <input
                        type="file"
                        id="excel-upload"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }} />

                    <label htmlFor="excel-upload" style={{ cursor: 'pointer', display: 'block' }}>
                        <i className="fas fa-file-excel fa-3x" style={{ color: '#7c30b8', marginBottom: '10px' }}></i>
                        <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '600', color: '#2d1f3d' }}>
                            {isDragging ? "¡Suéltalo aquí mismo!" : "Arrastra y suelta tu archivo Excel aquí"}
                        </p>
                        <span style={{ fontSize: '13px', color: '#8a7a99' }}>
                            o haz clic para buscarlo en tu computadora
                        </span>
                    </label>
                </div>

                {mostrarFormulario && (
                    <div className="formulario-cajas" style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '28px',
                        boxShadow: '0 10px 30px rgba(124, 48, 184, 0.06)',
                        border: '1px solid #e9e2f3',
                        marginBottom: '30px',
                        fontFamily: 'Segoe UI, sans-serif'
                    }}>
                        {/* Título e Indicador */}
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1eaf7', paddingBottom: '12px' }}>
                            <h4 style={{ color: '#2d1f3d', fontWeight: '600', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-file-invoice" style={{ color: '#7c30b8' }}></i>
                                {registroEnEdicion ? 'Modificar Registro Seleccionado' : 'Captura Manual de Solicitud'}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#8a7a99', fontWeight: '500' }}>* Campos obligatorios</span>
                        </div>

                        <form onSubmit={handleAgregarRegistro}>

                            {/* GRUPO 1: ORIGEN Y DESTINO (Distribución Pro) */}
                            <h5 style={{ fontSize: '13px', color: '#7c30b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>1. Logística de Origen y Destino</h5>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(12, 1fr)', // Sistema de 12 columnas estilo Bootstrap/Tailwind
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                {/* COOLER (Ocupa 4 de 12 columnas) */}
                                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Cooler *</label>
                                    <select name="cooler" value={formData.cooler} onChange={handleInputChange} required style={styles.selectBase}>
                                        <option value="">Seleccione...</option>
                                        {coolers.map(c => <option key={c.c_codigo_cam} value={c.c_codigo_cam}>{c.v_nombre_cam}</option>)}
                                    </select>
                                </div>

                                {/* CAMPO (Ocupa 5 de 12 columnas - Es más ancho porque los nombres son largos) */}
                                <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Campo *</label>
                                    <select
                                        name="campo"
                                        value={formData.campo}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.cooler}
                                        style={{ ...styles.selectBase, backgroundColor: !formData.cooler ? '#f5f2f8' : '#ffffff', color: !formData.cooler ? '#a395b0' : '#2d1f3d', cursor: !formData.cooler ? 'not-allowed' : 'default' }}
                                    >
                                        <option value="">{formData.cooler ? "Seleccione un campo..." : "Primero elige un Cooler..."}</option>
                                        {camposFiltrados.map((c) => (
                                            <option key={`${c.cCodigoCam}-${c.cCodigoCul}`} value={`${c.cCodigoCam}|${c.cCodigoCul}`}>{c.vNombreCam}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* FECHA DE SOLICITUD (Ocupa 3 de 12 columnas) */}
                                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Fecha Solicitud *</label>
                                    <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required style={styles.inputBase} />
                                </div>
                            </div>

                            {/* Separador sutil */}
                            <div style={{ height: '1px', backgroundColor: '#f5effa', marginBottom: '20px' }}></div>

                            {/* GRUPO 2: DETALLES DEL PRODUCTO (Distribución Pro) */}
                            {/* GRUPO 2: DETALLES DEL PRODUCTO (Distribución Pro y Equilibrada) */}
                            <h5 style={{ fontSize: '13px', color: '#7c30b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>2. Especificaciones del Producto</h5>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(12, 1fr)', // Volvemos a usar la rejilla de 12
                                gap: '16px',
                                marginBottom: '32px'
                            }}>
                                {/* SKU (Ocupa 2 de 12 columnas - Es un selector corto) */}
                                {/* SKU (Buscador con filtrado estricto por variable de React) */}
                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>SKU *</label>

                                    <input
                                        type="text"
                                        name="sku"
                                        list="opciones-sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        placeholder={formData.cCodigoCul ? "Escribe para buscar..." : "Bloqueado"}
                                        required
                                        disabled={!formData.cCodigoCul}
                                        style={{
                                            ...styles.inputBase,
                                            backgroundColor: !formData.cCodigoCul ? '#f5f2f8' : '#ffffff',
                                            color: !formData.cCodigoCul ? '#2d1f3d' : '#2d1f3d',
                                            cursor: !formData.cCodigoCul ? 'not-allowed' : 'default'
                                        }}
                                    />

                                    {/* El datalist ahora se alimenta de la lista previamente recortada por React */}
                                    <datalist id="opciones-sku">
                                        {tamaniosBusquedaFiltrados.map(t => (
                                            <option
                                                key={t.c_codigo_tam}
                                                value={t.c_codigo_tam}
                                            >
                                                {t.c_codigo_tam} - {t.v_nombre_tam}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>

                                {/* ETIQUETA / CLIENTE (Ocupa 3 de 12 columnas) */}
                                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Etiqueta</label>
                                    <input type="text" name="cliente" value={formData.cliente} readOnly style={styles.readOnlyBase} placeholder="Automático" />
                                </div>

                                {/* VARIEDAD (Ocupa 2 de 12 columnas) */}
                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Variedad</label>
                                    <input type="text" name="variedad" value={formData.variedad} readOnly style={styles.readOnlyBase} placeholder="Automático" />
                                </div>

                                {/* EMBALAJE (Ocupa 3 de 12 columnas) */}
                                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Embalaje</label>
                                    <input type="text" name="embalaje" value={formData.embalaje} readOnly style={styles.readOnlyBase} placeholder="Automático" />
                                </div>

                                {/* CANTIDAD CAJAS (Ocupa las últimas 2 columnas para sumar exactamente 12: 2+3+2+3+2 = 12) */}
                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: '#4a3b59', fontWeight: '600', fontSize: '13px' }}>Cantidad Cajas *</label>
                                    <input
                                        type="number"
                                        name="cajas"
                                        value={formData.cajas}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="1"
                                        required
                                        style={{
                                            ...styles.inputBase,
                                            border: '1px solid #7c30b8',
                                            color: '#7c30b8',
                                            fontWeight: '700',
                                            fontSize: '15px',
                                            backgroundColor: '#fdfaff' // Un fondo lila súper sutil para que resalte que es editable
                                        }}
                                    />
                                </div>
                            </div>
                            {/* SECCIÓN DE BOTONES DE ACCIÓN */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1eaf7', paddingTop: '20px' }}>
                                {registroEnEdicion && (
                                    <button
                                        type="button"
                                        onClick={handleCancelarEdicion}
                                        style={{ ...styles.btnBase, backgroundColor: '#ffffff', color: '#dc3545', border: '1px solid #dc3545', maxWidth: '180px' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdf2f2'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                                    >
                                        <i className="fas fa-times"></i> Cancelar
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    style={{ ...styles.btnBase, backgroundColor: '#7c30b8', color: '#ffffff', border: 'none', maxWidth: registroEnEdicion ? '220px' : '260px' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#622294'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c30b8'; }}
                                >
                                    <i className={`fas ${registroEnEdicion ? 'fa-save' : 'fa-plus'}`}></i>
                                    {registroEnEdicion ? 'Guardar Cambios' : 'Agregar a la Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {/* TABLA DE REGISTROS TEMPORALES (EN COLA DE GUARDADO) */}
                {registros.length > 0 && (
                    <div className="tabla-container">
                        <div className="rounded-3 shadow-sm mb-2 p-2 bg-light text-dark text-center">
                            <span className="fw-bold" style={{ color: '#7c30b8' }}><i className="fas fa-list-ul me-2"></i> LÍNEAS POR CONFIRMAR / GUARDAR</span>
                        </div>
                        <table className="tabla-cajas">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cooler</th>
                                    <th>Campo</th>
                                    <th>Etiqueta</th>
                                    <th>SKU</th>
                                    <th>Variedad</th>
                                    <th>Embalaje</th>
                                    <th>Cajas</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registros.map((registro) => {
                                    const coolerNombre = coolers.find(c => c.c_codigo_cam === registro.cooler)?.v_nombre_cam || '-';
                                    const campoNombre = campos.find(c => `${c.cCodigoCam}|${c.cCodigoCul}` === registro.campo)?.vNombreCam || '-';
                                    return (
                                        <tr key={registro.id}>
                                            <td>{(() => {
                                                // Si por alguna razón no hay fecha, evitamos que falle
                                                if (!registro.fecha) return '-';

                                                // 1. Si la fecha ya es un String
                                                if (typeof registro.fecha === 'string') {
                                                    // Caso: formato AAAA-MM-DD (viene con guiones)
                                                    if (registro.fecha.includes('-')) {
                                                        const [year, month, day] = registro.fecha.split('-');
                                                        return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                                                    }
                                                    // Caso: formato DD/MM/AAAA (viene con diagonales como en tu última imagen)
                                                    if (registro.fecha.includes('/')) {
                                                        const [day, month, year] = registro.fecha.split('/');
                                                        return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                                                    }
                                                }

                                                // 2. Si viene convertido en un objeto de Date de JavaScript o número
                                                const fechaObj = new Date(registro.fecha);
                                                if (!isNaN(fechaObj.getTime())) {
                                                    return fechaObj.toLocaleDateString('es-ES');
                                                }

                                                return String(registro.fecha);
                                            })()}</td>
                                            <td>{coolerNombre}</td>
                                            <td>{campoNombre}</td>
                                            <td>{registro.cliente}</td>
                                            <td>{registro.sku}</td>
                                            <td>{registro.variedad}</td>
                                            <td>{registro.embalaje}</td>
                                            <td className="cajas-cell">{registro.cajas}</td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button type="button" className="btn-editar" onClick={() => handleEditarRegistro(registro)} title="Editar línea">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button type="button" className="btn-eliminar" onClick={() => dispatch(removeRegistro(registro.id))} title="Eliminar línea">
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="resumen">
                            <div className="total">
                                <strong>Total de Cajas en Cola:</strong>
                                <span className="numero">{totalCajas}</span>
                            </div>
                            <div className="info-registros">
                                <small>{registros.length} línea(s) capturada(s) temporalmente</small>
                            </div>
                        </div>

                        <div className="acciones-guardado">
                            <button className="btn-guardar" onClick={handleGuardar}>
                                <i className="fas fa-save fa-lg"></i> Guardar Solicitud
                            </button>
                            <button className="btn-limpiar" onClick={() => {
                                // 1. Limpia las líneas de la tabla (Redux)
                                dispatch(clearRegistros());

                                // 2. Limpia los campos del formulario (Estado Local)
                                setFormData({
                                    cooler: '', campo: '', cCodigoCam: '', cCodigoCul: '',
                                    cliente: '', sku: '', variedad: '', embalaje: '', cajas: '', fecha: ''
                                });
                            }}>
                                <i className="fas fa-recycle fa-lg"></i> Limpiar Todo
                            </button>
                        </div>
                    </div>
                )}

                {/* TABLA DE REGISTROS YA GUARDADOS HOY EN BASE DE DATOS */}
                <div className="rounded-3 shadow-sm mb-3 mt-5" style={{ background: '#1f8047', color: 'white', padding: '6px 12px' }}>
                    <h6 className="m-0 fw-bold"><i className="fas fa-database me-2"></i> SOLICITUDES PROCESADAS EL DÍA DE HOY</h6>
                </div>


                <div className="table-responsive" style={{
                    borderRadius: '14px',
                    overflow: 'auto',
                    maxHeight: '450px',
                    boxShadow: '0 4px 15px rgba(124, 48, 184, 0.08)',
                    border: '1px solid #e1d5ed',
                    backgroundColor: '#fff'
                }}>
                    {solicitudesGuardadas.length === 0 ? (
                        <p className="text-muted text-center my-4" style={{ fontFamily: 'Segoe UI, sans-serif', color: '#8a7a99' }}>
                            <i className="fas fa-folder-open me-2" style={{ color: '#b39ddb' }}></i> No se han procesado solicitudes de cajas el día de hoy.
                        </p>
                    ) : (
                        <table className="table" style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: '0',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '14px',
                            margin: 0
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#7c30b8', color: '#ffffff' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff', borderTopLeftRadius: '14px' }}>Fecha</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff' }}>Cooler Destino</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff' }}>Campo Origen</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff' }}>Etiqueta</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff' }}>SKU</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff' }}>Cajas</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7c30b8', color: '#ffffff', borderTopRightRadius: '14px' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesGuardadas.map((sol, index) => {
                                    // Definimos el color base de la fila según si es par o impar
                                    const colorBase = index % 2 === 0 ? '#ffffff' : '#fcfaff';

                                    return (
                                        <tr
                                            key={sol.id_solicitud}
                                            style={{
                                                borderBottom: '1px solid #f1eaf7',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            // Cuando el cursor entra, pintamos el fondo de todas las celdas de esta fila
                                            onMouseEnter={(e) => {
                                                const celdas = e.currentTarget.querySelectorAll('td');
                                                celdas.forEach(td => td.style.backgroundColor = '#e9d5ff'); // <-- Aquí cambias tu morado hover
                                            }}
                                            // Cuando el cursor sale, regresamos las celdas a su color base (blanco o lila claro)
                                            onMouseLeave={(e) => {
                                                const celdas = e.currentTarget.querySelectorAll('td');
                                                celdas.forEach(td => td.style.backgroundColor = colorBase);
                                            }}
                                        >
                                            <td style={{ padding: '12px 16px', color: '#4a3b59', fontWeight: '500', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>
                                                {sol.fecha ? (() => {
                                                    const [year, month, day] = sol.fecha.split('T')[0].split('-');
                                                    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                                                })() : '-'}
                                            </td>

                                            <td style={{ padding: '12px 16px', color: '#2d1f3d', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>
                                                <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f0e6fa', color: '#7c30b8', fontWeight: '600', fontSize: '12px' }}>
                                                    {sol.cooler}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#554960', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>{sol.campo}</td>
                                            <td style={{ padding: '12px 16px', color: '#554960', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>{sol.etiqueta}</td>
                                            <td style={{ padding: '12px 16px', fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#6200ea', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>{sol.sku}</td>
                                            <td className="cajas-cell" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#7c30b8', fontSize: '15px', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>
                                                {sol.cajas.toLocaleString()}
                                            </td>

                                            <td style={{ padding: '12px 16px', textAlign: 'center', backgroundColor: colorBase, transition: 'background-color 0.2s' }}>
                                                <button
                                                    type="button"
                                                    className="btn-editar"
                                                    onClick={() => {
                                                        const coolerCod = coolers.find(c => c.v_nombre_cam === sol.cooler)?.c_codigo_cam || '';
                                                        const campoObj = campos.find(c => c.vNombreCam === sol.campo);

                                                        // === AQUÍ ACTIVAMOS EL FORMULARIO AL EDITAR ===
                                                        setMostrarFormulario(true);

                                                        setFormData({
                                                            cooler: coolerCod,
                                                            campo: campoObj ? `${campoObj.cCodigoCam}|${campoObj.cCodigoCul}` : '',
                                                            cCodigoCam: campoObj ? campoObj.cCodigoCam : '',
                                                            cCodigoCul: campoObj ? campoObj.cCodigoCul : '',
                                                            cliente: sol.etiqueta,
                                                            sku: sol.sku,
                                                            variedad: sol.variedad || 'N/A',
                                                            embalaje: sol.embalaje || 'N/A',
                                                            cajas: sol.cajas,
                                                            fecha: sol.fecha ? sol.fecha.split('T')[0] : ''
                                                        });

                                                        setRegistroEnEdicion(sol.id_solicitud);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#7c30b8',
                                                        border: '1px solid #7c30b8',
                                                        borderRadius: '6px',
                                                        padding: '6px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: '0 2px 4px rgba(124, 48, 184, 0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#7c30b8';
                                                        e.currentTarget.style.color = '#ffffff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                                        e.currentTarget.style.color = '#7c30b8';
                                                    }}
                                                    title="Editar registro en Base de Datos"
                                                >
                                                    <i className="fas fa-pencil-alt" style={{ fontSize: '12px' }}></i> Editar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};