import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startLoadingEnvios, startLoadingCoolers } from '../../store/slices/cooler/thunks';
import { setEnvios } from '../../store/slices/cooler/enviosCoolerSlice';
import { AuthContext } from '../../auth/context/AuthContext';

export const EnviosCoolerPage = () => {
  const dispatch = useDispatch();

  const { envios, coolers, isLoading } = useSelector(state => state.enviosCooler);
  const { user } = useContext(AuthContext);

  const [busqueda, setBusqueda] = useState('');
  const [selectedCooler, setSelectedCooler] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    dispatch(setEnvios([]));
    dispatch(startLoadingCoolers());

    return () => {
      dispatch(setEnvios([]));
    };
  }, [dispatch]);

  useEffect(() => {
    if (user?.field && user.field !== "") {
      setSelectedCooler(user.field);
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCooler || selectedCooler === "") return;

    dispatch(startLoadingEnvios(selectedCooler));

    const interval = setInterval(() => {
      dispatch(startLoadingEnvios(selectedCooler));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, selectedCooler]);

  const enviosFiltrados = envios.filter(e =>
    e.placas?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.campo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const normalizarEstatus = (envio) => (envio.VEstatusCoo || envio.estatus || '').trim().toUpperCase();

  const cajasIngresadas = envios.reduce((sum, envio) => {
    const cajas = Number(envio.cajas) || 0;
    const est = normalizarEstatus(envio);
    return (est === 'ENTRADA COOLER' || est === 'FRUTA EN PISO') ? sum + cajas : sum;
  }, 0);

  const cajasTransito = envios.reduce((sum, envio) => {
    const cajas = Number(envio.cajas) || 0;
    const est = normalizarEstatus(envio);
    return (est === 'ENTRADA COOLER' || est === 'FRUTA EN PISO') ? sum : sum + cajas;
  }, 0);

  const getStatusNeonClass = (status) => {
    switch (status) {
      case 'CARGANDO EN GALERA': return 'led-bar bg-primary shadow-blue';
      case 'SALIDA DE CAMPO': return 'led-bar bg-warning shadow-yellow blink';
      case 'LLEGADA COOLER': return 'led-bar bg-info shadow-cyan';
      case 'DESEMBARCANDO': return 'led-bar bg-danger shadow-danger blink';
      case 'FRUTA EN PISO': return 'led-bar bg-success shadow-green';
      default: return 'led-bar bg-secondary';
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    const slashIndex = text.indexOf('/');
    if (slashIndex >= 0) {
      return text.slice(0, slashIndex).trim();
    }
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
  };

  const formatHoraRegistro = (hora) => {
    if (!hora) return '';
    const texto = String(hora).trim();
    if (/[ap]m$/i.test(texto)) return texto.toUpperCase();
    const match = texto.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
      let hour = Number(match[1]);
      const minutes = match[2];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
    return texto;
  };

  const getHoraEstatus = (envio) => {
    if (envio.hora_estatus) return formatHoraRegistro(envio.hora_estatus);
    const status = (envio.VEstatusCoo || '').trim().toUpperCase();
    const timeField = status === 'CARGANDO EN GALERA' ? envio.DHcargandoCoo :
      status === 'SALIDA DE CAMPO' ? envio.DHsalidaranchoCoo :
        status === 'LLEGADA A COOLER' ? envio.DHllegadacoolerCoo :
          status === 'DESEMBARCANDO' ? envio.DHdesembarcandoCoo :
            status === 'FRUTA EN PISO' ? envio.DHentradacoolerCoo :
              envio.DHcargandoCoo || envio.DHsalidaranchoCoo || envio.DHllegadacoolerCoo || envio.DHdesembarcandoCoo || envio.DHentradacoolerCoo || '';
    return formatHoraRegistro(timeField);
  };

  const getEstatusRegistro = (envio) => envio.VEstatusCoo || envio.estatus || '';

  const ahora = new Date();
  const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fechaFormateada = ahora.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const selectedCoolerName = coolers.find(c => String(c.c_codigo_cam) === String(selectedCooler))?.v_nombre_cam || '';

  return (
    <>
      <style type="text/css">
        {`
            #pagesContainer {
                height: 88vh; 
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .board-screen {
                background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
                border: 4px solid #334155;
                border-radius: 12px;
                position: relative;
                box-shadow: 0 15px 35px rgba(0,0,0,0.6);
                font-family: 'Share Tech Mono', monospace;
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }

            .board-header-fids {
                padding: 10px 25px;
                border-bottom: 2px solid rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                background: rgba(0,0,0,0.3);
                flex-shrink: 0;
            }

            .table-scroll-area {
                overflow-y: auto !important;
                flex: 1;
            }

            .fids-table-main {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }

            .fids-table-main thead th {
                color: #38bdf8;
                text-transform: uppercase;
                font-size: 16px;
                padding: 15px;
                background: #0f172a;
                position: sticky;
                top: 0;
                z-index: 10;
                border-bottom: 2px solid #334155;
            }

            .fids-table-main tbody td {
                padding: 12px 15px;
                color: #f8fafc;
                font-size: 1.1rem;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                word-wrap: break-word;
                white-space: normal;
                word-break: break-word;
            }

            .fids-table-main tbody tr:hover {
                background: rgba(56, 189, 248, 0.08);
                transition: background 120ms ease;
            }

            .led-bar { display: inline-block; width: 30px; height: 8px; border-radius: 2px; margin-right: 10px; }
            .shadow-blue { box-shadow: 0 0 10px #007bff; }
            .shadow-yellow { box-shadow: 0 0 10px #ffc107; }
            .shadow-green { box-shadow: 0 0 10px #28a745; }
            .shadow-orange { box-shadow: 0 0 10px #fd7e14; }
            .shadow-cyan { box-shadow: 0 0 10px #0dcaf0; }
            
            .sub-label-fids { display: block; font-size: 11px; color: #94a3b8; font-family: sans-serif; text-transform: uppercase; }
            
            .table-scroll-area::-webkit-scrollbar { width: 10px; }
            .table-scroll-area::-webkit-scrollbar-track { background: #0f172a; }
            .table-scroll-area::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; border: 2px solid #0f172a; }
            .table-scroll-area::-webkit-scrollbar-thumb:hover { background: #7c30b8; }

            .blink { animation: blinker 1.5s linear infinite; }
            @keyframes blinker { 50% { opacity: 0.2; } }
            
            /* Ajuste para mensajes de error/vacío en el monitor */
            .fids-msg { color: #94a3b8 !important; font-weight: bold; letter-spacing: 1px; }
        `}
      </style>

      <br /><br />

      <div id="pagesContainer" className="container-fluid rounded-3 p-4 mt-2 animate__animated animate__fadeIn" style={{ background: 'white', marginBottom: '40px' }}>

        {/* <div className="rounded-3 shadow-sm mb-2" style={{ background: '#7c30b8', color: 'white', padding: '8px 12px', textAlign: 'center' }}>
          <h5 className="m-0 fw-bold" style={{ fontSize: '16px' }}>MONITOR DE ENVÍOS - {isLoading ? 'SINCRONIZANDO...' : 'EN VIVO'}</h5>
        </div> */}

        {isAdmin && (
          <div className="search-container shadow-sm mb-3 p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <select
                  className="form-select form-select-sm"
                  style={{
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    appearance: 'auto',
                    WebkitAppearance: 'menulist-button',
                    MozAppearance: 'listbox'
                  }}
                  value={selectedCooler}
                  onChange={(e) => setSelectedCooler(e.target.value)}
                >
                  <option value="">-- Seleccione cooler --</option>
                  {coolers.map(c => (
                    <option key={c.c_codigo_cam} value={c.c_codigo_cam}>{c.v_nombre_cam}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-8">
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <label htmlFor="envio-search" className="mb-0 text-secondary" style={{ fontSize: '12px' }}>Buscar</label>
                  <input
                    id="envio-search"
                    type="text"
                    className="form-control form-control-sm"
                    style={{ width: '220px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                    placeholder="Campo o Placas..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-3 mb-3">
          <div className="p-1 rounded-3 shadow-sm" style={{ flex: 1, background: '#0f172a', border: '1px solid #334155' }}>
            <div className="text-uppercase" style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>Cajas en tránsito</div>
            <div className="fw-bold" style={{ fontSize: '18px', color: '#f8fafc' }}>{cajasTransito}</div>
          </div>
          <div className="p-1 rounded-3 shadow-sm" style={{ flex: 1, background: '#0f172a', border: '1px solid #334155' }}>
            <div className="text-uppercase" style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '1px' }}>Cajas ingresadas a cooler</div>
            <div className="fw-bold" style={{ fontSize: '18px', color: '#38bdf8' }}>{cajasIngresadas}</div>
          </div>
        </div>

        <div className="board-screen shadow-lg w-100">
          <div className="board-header-fids">
            <div className="airport-clock"></div>
            <div>
              <h5 className="m-0 text-white fw-bold uppercase">
                {isAdmin ? 'MONITOR DE COOLER' : `SALIDAS - ${selectedCoolerName}`}
              </h5>
              <small style={{ color: '#38bdf8', fontSize: '10px' }}>AGROBERRIES COOLER TRACKING SYSTEM</small>
            </div>
            <div className="ms-auto text-end text-white fw-bold" style={{ fontFamily: 'Share Tech Mono' }}>
              <div style={{ fontSize: '20px' }}>{horaFormateada}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{fechaFormateada}</div>
            </div>
          </div>

          <div className="table-scroll-area">
            <table className="fids-table-main">
              <thead>
                <tr>
                  <th style={{ width: '15%' }} className="text-center">HORA / CHOFER</th>
                  {/* <th style={{ width: '18%' }}>DESTINO / CHOFER</th> */}
                  <th style={{ width: '45%' }}>PRODUCTO / ORIGEN</th>
                  <th style={{ width: '15%' }}>CAJAS / ENVASE / TAMAÑO</th>
                  <th style={{ width: '10%' }} className="text-center">% cumplimiento</th>
                  <th style={{ width: '20%' }} className="text-center">ESTATUS</th>
                </tr>
              </thead>
              <tbody>
                {selectedCooler === "" ? (
                  <tr><td colSpan="5" className="text-center p-5 fids-msg">POR FAVOR SELECCIONE UN COOLER</td></tr>
                ) :
                  enviosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-5 fids-msg">NO HAY ENVÍOS PARA EL COOLER SELECCIONADO</td></tr>
                  ) : (
                    enviosFiltrados.map((envio, index) => (
                      <tr key={index}>
                        <td className='text-center'>
                          {/* Hora */}
                          <span className="fw-bold" style={{ color: '#f9c12a', fontSize: '18px' }}>
                            {getHoraEstatus(envio)}
                          </span>

                          {/* Destino: Blanco normal */}
                          <span className="sub-label-fids" style={{ color: '#FFFFFF' }}>
                            {envio.destino}
                          </span>

                          {/* Chofer */}
                          <span className="sub-label-fids" style={{ color: '#38bdf8', fontWeight: 'bold'}}>
                            CHOFER: {envio.chofer}
                          </span>

                          {/* Placas: Color llamativo (puedes elegir entre los ejemplos de abajo) */}
                          <span className="sub-label-fids" style={{ color: '#ffae00', fontWeight: 'bold'}}>
                            PLACAS: {envio.placas}
                          </span>
                        </td>
                        {/* <td>
                        <span className="fw-bold">{envio.destino}</span>
                        <span className="sub-label-fids">PLACAS: {envio.placas}</span> */}
                        {/* <span className="sub-label-fids">CUADRILLERO: {envio.cuadrillero}</span> */}
                        {/* <span className="sub-label-fids" style={{color: '#38bdf8', fontWeight: 'bold'}}>CHOFER: {envio.chofer}</span>
                      </td> */}
                        <td>
                          <span className="fw-bold" style={{ color: '#00FF00', fontSize: '17px' }} title={envio.nomproducto}>
                            {envio.codproducto} - {truncateText(envio.nomproducto, 80)}
                          </span>
                          <span className="sub-label-fids" style={{ color: '#38bdf8', fontWeight: 'bold' }}>{envio.campo} - {envio.sector}</span>
                        </td>
                        <td>
                          <span className="fw-bold">TOTAL DE CAJAS: {envio.cajas}</span>
                          <span className="sub-label-fids" style={{ color: '#9035e6', fontWeight: 'bold' }}>ENVASE: {envio.v_nombre_env}</span>
                          <span className="sub-label-fids" style={{ color: '#a3e635', fontWeight: 'bold' }}>ETIQUETA: {envio.v_nombre_eti}</span>
                          {/* <span className="sub-label-fids" style={{color: '#a3e635', fontWeight: 'bold'}}>ETIQUETA: {envio.v_nombre_eti}</span> */}
                          <span className="sub-label-fids" style={{ color: '#f83838', fontWeight: 'bold' }}>TAMAÑO: {envio.v_nombre_tam}</span>
                        </td>
                        <td className="text-center">
                          {/* Porcentaje de cumplimiento pendiente */}
                          {/* <span className="fw-bold" style={{ color: '#38bdf8', fontSize: '18px' }}>
                            {envio.porcentaje_cumplimiento ? `${envio.porcentaje_cumplimiento}%` : 'N/A'}
                          </span> */}
                        </td>
                        <td className="text-center" style={{ paddingRight: '25px' }}>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span className={getStatusNeonClass(getEstatusRegistro(envio))}></span>
                            <span className="fw-bold" style={{ fontSize: '15px' }}>{getEstatusRegistro(envio)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-3 text-muted">
          <small style={{ fontSize: '11px' }}>SISTEMA DE MONITOREO COOLERTRACK V1.0.0 | AGROBERRIES</small>
        </div>
      </div>
    </>
  );
};