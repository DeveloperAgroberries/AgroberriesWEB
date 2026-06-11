import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { addRegistro, removeRegistro, clearRegistros, setCatalogos, updateRegistroState } from '../../store/slices/cajas/solicitudCajasSlice';
import { startGuardarSolicitud, startActualizarSolicitud } from '../../store/slices/cajas/thunks';
import { agregarSolicitudCajas } from '../../sqlserver/cajasCRUD';
import { AuthContext } from '../../auth/context/AuthContext';
import '../../css/cajas.css';

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

                    // 1. Intento rápido: Coincidencia exacta o directa por inclusión mutua
                    const coincidenciaDirecta = catalogo.find(item => {
                        const nombreCat = normalizar(item[propiedadNombre]);
                        return nombreCat === textoLimpio || nombreCat.includes(textoLimpio) || textoLimpio.includes(nombreCat);
                    });
                    if (coincidenciaDirecta) return coincidenciaDirecta;

                    // 2. Intento avanzado: Segmentación por palabras (Soporta errores como "lagos aranda")
                    const palabrasExcel = textoLimpio.split(/\s+/).filter(p => p.length > 2); // Ignoramos conectores cortos de 1 o 2 letras

                    let mejorMatch = null;
                    let maxCoincidencias = 0;

                    catalogo.forEach(item => {
                        const nombreCat = normalizar(item[propiedadNombre]);
                        // Contamos cuántas palabras del Excel aparecen en este elemento del catálogo
                        const coincidencias = palabrasExcel.filter(palabra => nombreCat.includes(palabra)).length;

                        if (coincidencias > maxCoincidencias) {
                            maxCoincidencias = coincidencias;
                            mejorMatch = item;
                        }
                    });

                    // Si compartieron al menos una palabra clave larga, lo damos por válido
                    return maxCoincidencias > 0 ? mejorMatch : null;
                };

                data.forEach((row, index) => {
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

                    // 3. BUSCAR DATOS DEL SKU
                    const skuEncontrado = SKUs.find(s => s.codigo === skuFormateado);

                    const nuevoRegistro = {
                        id: Date.now() + index + Math.random(),
                        fecha: row.fecha,
                        cooler: coolerCodigo,
                        cCodigoCam: campoCodigo,
                        cCodigoCul: cultivoCodigo,
                        campo: `${campoCodigo}|${cultivoCodigo}`,
                        sku: skuFormateado,
                        cliente: skuEncontrado ? skuEncontrado.cliente : (row.cliente ? String(row.cliente).trim() : 'N/A'),
                        variedad: skuEncontrado ? skuEncontrado.variedad : (row.variedad ? String(row.variedad).trim() : 'N/A'),
                        embalaje: skuEncontrado ? skuEncontrado.embalaje : (row.embalaje ? String(row.embalaje).trim() : 'N/A'),
                        cajas: parseInt(row.cajas) || 0,
                        usuario: user?.id || 'Usuario',
                        fechaCreacion: new Date().toLocaleString('es-ES')
                    };
                    dispatch(addRegistro(nuevoRegistro));
                });

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
        "0062": ["briseño"],       // COOLER ZACOALCO
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
            // Normalizamos el nombre del campo (le quitamos acentos y pasamos a minúsculas)
            const nombreCampoNormalizado = campo.vNombreCam
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

            // El campo pasa el filtro si contiene AL MENOS una de las palabras clave del cooler
            return palabrasClave.some(palabra => nombreCampoNormalizado.includes(palabra));
        });
    }, [formData.cooler, campos]);

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
                            <label className="btn btn-success m-0" style={{ cursor: 'pointer', background: '#1f8047', borderColor: '#1f8047' }}>
                                <i className="fas fa-file-excel me-2"></i> Importar Excel
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                            <button className="btn btn-outline-secondary" type="button" onClick={descargarPlantilla}>
                                <i className="fas fa-download me-2"></i> Obtener Plantilla
                            </button>
                        </div>
                    </div>
                </div>

                <div className="formulario-cajas">
                    <form onSubmit={handleAgregarRegistro}>
                        <div className="formulario-grid">
                            <div className="form-group">
                                <label>Cooler *</label>
                                <select name="cooler" value={formData.cooler} onChange={handleInputChange} required>
                                    <option value="">Seleccione...</option>
                                    {coolers.map(c => <option key={c.c_codigo_cam} value={c.c_codigo_cam}>{c.v_nombre_cam}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Campo *</label>
                                <select name="campo" value={formData.campo} onChange={handleInputChange} required disabled={!formData.cooler}>
                                    <option value="">
                                        {formData.cooler ? "Seleccione un campo..." : "Primero elige un Cooler..."}
                                    </option>
                                    {camposFiltrados.map((c) => (
                                        <option key={`${c.cCodigoCam}-${c.cCodigoCul}`} value={`${c.cCodigoCam}|${c.cCodigoCul}`}>
                                            {c.vNombreCam}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>SKU *</label>
                                <select name="sku" value={formData.sku} onChange={handleInputChange} required disabled={!formData.cCodigoCul}>
                                    <option value="">Seleccione...</option>
                                    {tamaniosFiltrados.map(t => <option key={t.c_codigo_tam} value={t.c_codigo_tam}>{t.c_codigo_tam} - {t.v_nombre_tam}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Etiqueta *</label>
                                <input type="text" name="cliente" value={formData.cliente} onChange={handleInputChange} placeholder="Ej: Berry Fresh" readOnly required />
                            </div>

                            <div className="form-group">
                                <label>Variedad *</label>
                                <input type="text" name="variedad" value={formData.variedad} onChange={handleInputChange} placeholder="Ej: Sweet Karoline" readOnly required />
                            </div>

                            <div className="form-group">
                                <label>Embalaje *</label>
                                <input type="text" name="embalaje" value={formData.embalaje} onChange={handleInputChange} placeholder="Ej: 12x18oz BF SK" readOnly required />
                            </div>

                            <div className="form-group">
                                <label>Cajas *</label>
                                <input type="number" name="cajas" value={formData.cajas} onChange={handleInputChange} placeholder="0" min="1" required />
                            </div>

                            <div className="form-group">
                                <label>Fecha de Solicitud *</label>
                                <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-agregar" style={{ flex: 1 }}>
                                <i className={`fas ${registroEnEdicion ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                                {registroEnEdicion ? 'Actualizar Línea' : 'Agregar Línea a la Solicitud'}
                            </button>
                            {registroEnEdicion && (
                                <button type="button" className="btn-limpiar" onClick={handleCancelarEdicion} style={{ flex: 1 }}>
                                    <i className="fas fa-times me-2"></i> Cancelar Edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>

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


                <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(124, 48, 184, 0.08)', border: '1px solid #e1d5ed', backgroundColor: '#fff' }}>
                    {solicitudesGuardadas.length === 0 ? (
                        <p className="text-muted text-center my-4" style={{ fontFamily: 'Segoe UI, sans-serif', color: '#8a7a99' }}>
                            <i className="fas fa-folder-open me-2" style={{ color: '#b39ddb' }}></i> No se han procesado solicitudes de cajas el día de hoy.
                        </p>
                    ) : (
                        <table className="tabla-cajas" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Segoe UI, sans-serif', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #7c30b8 0%, #9652d9 100%)', color: '#ffffff' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>Fecha</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>Cooler Destino</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>Campo Origen</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>Etiqueta</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', letterSpacing: '0.5px' }}>SKU</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', letterSpacing: '0.5px' }}>Cajas</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', letterSpacing: '0.5px' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesGuardadas.map((sol, index) => (
                                    <tr
                                        key={sol.id_solicitud}
                                        style={{
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfaff',
                                            borderBottom: '1px solid #f1eaf7',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3e8ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fcfaff'}
                                    >
                                        <td style={{ padding: '12px 16px', color: '#4a3b59', fontWeight: '500' }}>
                                            {sol.fecha ? (() => {
                                                const [year, month, day] = sol.fecha.split('T')[0].split('-');
                                                return new Date(year, month - 1, day).toLocaleDateString('es-ES');
                                            })() : '-'}
                                        </td>

                                        <td style={{ padding: '12px 16px', color: '#2d1f3d' }}>
                                            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f0e6fa', color: '#7c30b8', fontWeight: '600', fontSize: '12px' }}>
                                                {sol.cooler}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#554960' }}>{sol.campo}</td>
                                        <td style={{ padding: '12px 16px', color: '#554960' }}>{sol.etiqueta}</td>
                                        <td style={{ padding: '12px 16px', fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#6200ea' }}>{sol.sku}</td>
                                        <td className="cajas-cell" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#7c30b8', fontSize: '15px' }}>
                                            {sol.cajas.toLocaleString()}
                                        </td>

                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn-editar"
                                                onClick={() => {
                                                    const coolerCod = coolers.find(c => c.v_nombre_cam === sol.cooler)?.c_codigo_cam || '';
                                                    const campoObj = campos.find(c => c.vNombreCam === sol.campo);

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
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};