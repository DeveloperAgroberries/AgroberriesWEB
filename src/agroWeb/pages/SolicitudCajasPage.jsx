import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { addRegistro, removeRegistro, clearRegistros, setCatalogos } from '../../store/slices/cajas/solicitudCajasSlice';
import { startGuardarSolicitud } from '../../store/slices/cajas/thunks';
import { agregarSolicitudCajas } from '../../sqlserver/cajasCRUD';
import { AuthContext } from '../../auth/context/AuthContext';
import { format } from 'date-fns';
import '../../css/cajas.css';

export const SolicitudCajasPage = () => {

    const dispatch = useDispatch();
    const { user } = useContext(AuthContext);
    const { registros, coolers, tamanios, campos, SKUs } = useSelector(state => state.solicitudCajas);

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

    // Calcular campos filtrados basado en el cooler seleccionado
    // const camposFiltrados = formData.cooler
    //     ? campos.filter(c => c.cCodigoCam === formData.cooler)
    //     : campos;

    // Calcular tamaños filtrados basado en el cultivo seleccionado
    const tamaniosFiltrados = formData.cCodigoCul
        ? tamanios.filter(t => t.c_codigo_cul === formData.cCodigoCul)
        : tamanios;

    // Cargar catálogos al montar el componente
    useEffect(() => {
        const fetchCatalogos = async () => {
            const [dataCoolers, dataTamanios, dataCampos, dataSKUs] = await Promise.all([
                agregarSolicitudCajas.getCoolers(),
                agregarSolicitudCajas.getTamanios(),
                agregarSolicitudCajas.getCamposSectores(), // Llamada nueva
                agregarSolicitudCajas.getSKUs() // Llamada nueva
            ]);
            dispatch(setCatalogos({
                coolers: dataCoolers,
                tamanios: dataTamanios,
                campos: dataCampos,
                SKUs: dataSKUs
            }));
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
            // Buscar el SKU en la lista de SKUs y auto-completar campos
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

    const handleAgregarRegistro = (e) => {
        e.preventDefault();

        if (!formData.cooler || !formData.cliente || !formData.sku || !formData.cajas) {
            Swal.fire('Error', 'Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (registroEnEdicion) {
            // Actualizar registro existente
            const registroActualizado = {
                // ...registros.find(r => r.id === registroEnEdicion),
                ...formData,
                cajas: parseInt(formData.cajas)
            };

            dispatch(removeRegistro(registroEnEdicion));
            dispatch(addRegistro(registroActualizado));
            setRegistroEnEdicion(null);
        } else {
            // Crear nuevo registro
            const nuevoRegistro = {
                id: Date.now(),
                fecha: formData.fecha,
                ...formData,
                cajas: parseInt(formData.cajas),
                usuario: localStorage.getItem('usuario') || 'Usuario',
                fechaCreacion: new Date().toLocaleString('es-ES')
            };
            dispatch(addRegistro(nuevoRegistro));
        }

        setFormData({
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
    };

    const handleGuardar = async () => {
        if (registros.length === 0) {
            Swal.fire('Atención', 'No hay registros para guardar', 'warning');
            return;
        }

        // console.log("Datos sin filtrar:", registros);

        const datosParaGuardar = registros.map(reg => ({
            iIdSolicitudCaj: 0, // Como es autoincrement, 0 funciona
            vCodcoolerCaj: reg.cooler,
            vCodcampoCaj: reg.cCodigoCam,
            vCodcultivoCaj: reg.cCodigoCul,
            vClienteCaj: reg.cliente,
            vSkuCaj: reg.sku,
            vVariedadCaj: reg.variedad,
            vEmbalajeCaj: reg.embalaje,
            iCajasCaj: reg.cajas,
            vUsuarioCaj: user?.id || 'Usuario',
            dFechaCaj: reg.fecha,
            dFechacreacionCaj: new Date().toISOString()
        }));

        console.log("Datos filtrados:", datosParaGuardar);
        // return; // Detenemos la ejecución para evitar guardar durante las pruebas

        const result = await Swal.fire({
            title: 'Confirmar solicitud',
            text: "¿Estás seguro de enviar la solicitud de cajas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c30b8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar'
        });

        if (result.isConfirmed) {
            const exito = await dispatch(startGuardarSolicitud(datosParaGuardar));
            if (exito) {
                Swal.fire('¡Éxito!', 'Solicitud guardada correctamente', 'success');
                dispatch(clearRegistros());
            } else {
                Swal.fire('Error', 'Hubo un problema al guardar la solicitud', 'error');
            }
        }
    };

    const totalCajas = registros.reduce((sum, reg) => sum + reg.cajas, 0);

    return (
        <>
            <br /> <br />
            <div id="pagesContainer" className="container-fluid rounded-3 p-4 mt-2 animate__animated animate__fadeIn" style={{ background: 'white', marginBottom: '40px' }}>
                <div className="rounded-3 shadow-sm mb-2" style={{ background: '#7c30b8', color: 'white', padding: '8px 12px', textAlign: 'center' }}>
                    <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>SOLICITUD DE CAJAS</h5>
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
                                <select name="campo" value={formData.campo} onChange={handleInputChange} required>
                                    <option value="">Seleccione...</option>
                                    {campos.map((c) => (
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
                                <label>Cliente *</label>
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
                                    <i className="fas fa-times me-2"></i> Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>


                {registros.length > 0 && (
                    <div className="tabla-container">
                        <table className="tabla-cajas">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cooler</th>
                                    <th>Campo</th>
                                    <th>Cliente</th>
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
                                                const [year, month, day] = registro.fecha.split('-');
                                                return new Date(year, month - 1, day).toLocaleDateString('es-ES');
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
                                <strong>Total de Cajas:</strong>
                                <span className="numero">{totalCajas}</span>
                            </div>
                            <div className="info-registros">
                                <small>{registros.length} línea(s) capturada(s)</small>
                            </div>
                        </div>

                        <div className="acciones-guardado">
                            <button className="btn-guardar" onClick={handleGuardar}>
                                <i className="fas fa-save fa-lg"></i> Guardar Solicitud
                            </button>
                            <button className="btn-limpiar" onClick={() => dispatch(clearRegistros())}>
                                <i className="fas fa-recycle fa-lg"></i> Limpiar Todo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};