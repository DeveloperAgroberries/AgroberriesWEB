import { useEffect, useState, useRef } from "react";
import { ActivosList } from "../components/Combustibles/ActivosList";
import { AddActivo } from "../components/Combustibles/AddActivo";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import leaf_loader_slow from '../../../assets/leaf_loader_slow.gif';
import { getActivos } from "../../store/slices/combustibles";

export const ActivosPage = () => {
    const dispatch = useDispatch();
    const { subfamilias } = useSelector((state) => state.combustibles);
    const { data: activosData, isLoading, errorMessage } = ActivosList();
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para controlar la visibilidad
    const baseURL = import.meta.env.VITE_API_URL;
    const headerRef = useRef(null); // Referencia para el encabezado de la columna
    const opeHeaderRef = useRef(null); // Referencia para el encabezado de la columna
    const tooltipDRef = useRef(null); // para "D"
    const tooltipORef = useRef(null); // para "O"
    let tooltipInstance = null;

    const openActivoPopup = () => {
        setIsPopupOpen(true); // Función para mostrar el modal
    };

    const closeActivoPopup = async () => {
        setIsPopupOpen(false);
        await dispatch(getActivos()); // Vuelve a obtener la lista actualizada
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
            selector: row => row.cCodigoAfi,
            sortable: true,
            width: '150px',
        },
        {
            name: "Nombre AF",
            selector: row => row.vNombreAfi,
            sortable: true,
            width: '370px',
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
            width: '220px',
        },
        {
            name: 'Factura',
            cell: row => {
                const facturaDisponible = row.cRutafactAfi != null && row.cRutafactAfi !== '';
                return (
                    facturaDisponible ? (
                        <a
                            href={baseURL + '/CombustiblesApp/facturas/' + row.cRutafactAfi}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver Factura
                        </a>
                    ) : (
                        'N/D'
                    )
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
            width: '100px',
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
            width: '100px',
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
    const handleChange = (e) => {
        console.log(e.target.value)
        const filterRecords = activosData.filter(record => {
            return record.vNombreAfi.toLowerCase().includes(e.target.value.toLowerCase())
        })
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

    return (
        <>
            <style type="text/css">
                {`
                    .mi-tabla-activos .rdt_TableRow:hover {
                        background-color: #a5ee9d;
                        cursor: pointer;
                    }
                     .data-table-container { /* Nuevo estilo para el contenedor de la tabla */
                        height: 500px; /* Establece la altura deseada */
                        overflow-y: auto; /* Agrega scroll vertical si el contenido excede la altura */
                    }   
                    .contenedor-de-la-tabla {
                        height: 60vh; /* O una altura fija, ej. 500px */
                        display: flex; /* Si necesitas que la tabla se ajuste a este contenedor */
                        flex-direction: column;
                    }
                `}
            </style>
            <hr />
            <hr />
            <hr />
            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <div className="rounded-3" style={{ background: '#198754', color: 'white', fontSize: '35px', textAlign: 'center' }}>
                    <strong>Activos Fijos</strong>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-3" style={{ marginBottom: '1%' }}>
                    <p className="m-0">Consulta y registro de Activos Fijos.</p>
                    {/* Input de búsqueda */}
                    <input
                    type="text"
                    className="form-control"
                    id="miInput"
                    onChange={handleChange}
                    placeholder="Busqueda por nombre..."
                    style={{ width: '300px' }} 
                />
                </div>
                
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
                <div className="contenedor-de-la-tabla">
                    <DataTable
                        className="mi-tabla-activos"
                        customStyles={customStyles}
                        columns={columns}
                        data={initialLoadComplete ? (records.length === 0 ? activosData : records) : []}
                        // selectableRows
                        // pagination
                        // paginationPerPage={10}
                        // paginationComponentOptions={{
                        //     rowsPerPageText: 'Filas por página:',
                        //     rangeSeparatorText: 'de',
                        //     selectAllRowsItem: 'Todos',
                        //     selectAllRowsItemText: 'Mostrar Todos',
                        // }}
                        onSelectedRowsChange={data => console.log(data)}
                        fixedHeader
                        progressPending={!initialLoadComplete}
                        progressComponent={
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                <img
                                    src={leaf_loader_slow}
                                    alt="Cargando..."
                                    style={{ width: '64px', height: '64px' }}
                                />
                                <span style={{ marginTop: '10px' }}>Cargando...</span> {/* Texto abajo con un margen superior */}
                            </div>
                        }
                        fluid // Esta propiedad hace que las columnas se expandan para llenar el espacio
                    />
                </div>

                {/* </div> */}
                <div className="ms-2 mb-1 mt-2">
                    <button className="btn btn-success rounded-2 m-1" onClick={() => openActivoPopup(<AddActivo onClose={closeActivoPopup} />)}>Agregar AF</button>
                    {/* <button className="btn btn-outline-primary rounded-2 m-1" onClick={() => openActivoPopup(<ModVehicle onClose={closeActivoPopup} />)}>Modificar</button> */}
                    {/* <button className="btn btn-outline-danger rounded-2 m-1" onClick={ () => openVehiclePopup(<DelVehicle onClose={ closeVehiclePopup }/>) }>Eliminar</button> */}
                </div>
                {/* Renderizado condicional del modal FUERA de la tabla */}
                {isPopupOpen && (
                    <AddActivo onClose={closeActivoPopup} subfamilias={subfamilias} />
                )}
            </div>
        </>
    )
}