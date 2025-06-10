import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReporte } from "../../store/slices/combustiblesMod";
import DataTable from "react-data-table-component";
import leaf_loader_slow from '../../../assets/leaf_loader_slow.gif';
import { DownloadTableExcel } from "react-export-table-to-excel";

export const ReporteCombustibles = () => {
    const dispatch = useDispatch();
    const { reporte = [], isLoading: isLoading, errorMessage: errorMessage } = useSelector((state) => state.combustiblesMod);
    const tableRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(getReporte());
        };
        fetchData();
    }, [dispatch]);
    //console.log("Reporte:", reporte); // <---- ¿Qué se imprime aquí?

    //UNICO USEEFFECT QUE MUESTRA LA TABLA Y MODAL DE CARGA DESPUES DE 3 SEGUNDOS
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // console.log("combustibleData:", combustibleData);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        // Función de limpieza para evitar fugas de memoria
        return () => clearTimeout(timeout);
    }, [reporte]);

    const columns = [
        {
            name: "Fecha",
            selector: row => row.fecha,
            sortable: true,
        },
        {
            name: "Semana",
            selector: row => row.semana,
            sortable: true,
        },
        {
            name: "Num economico",
            selector: row => row.numEconomico,
            sortable: true,
        },
        {
            name: "hr_km",
            selector: row => row.hr_km,
            sortable: true,
        },
        {
            name: "Operador",
            selector: row => row.operador,
            // sortable: true,
        },
        {
            name: "Tipo combustible",
            selector: row => row.tipoCombus,
            // sortable: true,
        },
        {
            name: "Lts",
            selector: row => row.lts,
            // sortable: true,
        },
        {
            name: "Campo",
            selector: row => row.campo,
            // sortable: true,
        },
        {
            name: "Actividad",
            selector: row => row.actividad,
            // sortable: true,
        },
        {
            name: "Zona",
            selector: row => row.zona,
            // sortable: true,
        },
        {
            name: "Precio Semanal",
            selector: row => row.precioSemanal,
            // sortable: true,
        },
        {
            name: "Precio Consumo",
            selector: row => row.precioConsumo,
            // sortable: true,
        },
        {
            name: "ultKm",
            selector: row => row.ultKm,
            // sortable: true,
        },
        {
            name: "Km",
            selector: row => row.km,
            // sortable: true,
        },
        {
            name: "Rendimiento",
            selector: row => row.rendimiento,
            // sortable: true,
        },
        {
            name: "cC",
            selector: row => row.cc,
            // sortable: true,
        },
        {
            name: "Has",
            selector: row => row.has,
            // sortable: true,
        },
        {
            name: "PesosHas",
            selector: row => row.pesosHas,
            // sortable: true,
        }
    ];

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
                `}
            </style>
            <hr />
            <hr />
            <hr />
            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <h1>Reporte de combustible</h1>
                <div className="d-flex justify-content-between align-items-center mt-3" style={{ marginBottom: '1%' }}>
                    <p className="m-0">Consulta de surtido de combustibles en todos nuestros campos.</p>
                    <DownloadTableExcel
                        filename="Registros de Combustible"
                        sheet="Registros"
                        currentTableRef={tableRef.current}
                    >
                        <button className="btn btn-outline-success rounded-2">Exportar a Excel</button>
                    </DownloadTableExcel>
                </div>
                <DataTable
                    className="mi-tabla-activos"
                    customStyles={customStyles}
                    columns={columns}
                    data={reporte}
                    pagination// Esta propiedad hace que las columnas se expandan para llenar el espacio
                    progressPending={loading}
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
                />
                {/* TABLA PARA EXPORTAR */}
                <table ref={tableRef} style={{ display: 'none' }}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Semana</th>
                            <th>Num economico</th>
                            <th>hr_km</th>
                            <th>Operador</th>
                            <th>Tipo combustible</th>
                            <th>Lts</th>
                            <th>Campo</th>
                            <th>Actividad</th>
                            <th>Zona</th>
                            <th>Precio Semanal</th>
                            <th>Precio Consumo</th>
                            <th>ultKm</th>
                            <th>Km</th>
                            <th>Rendimiento</th>
                            <th>cC</th>
                            <th>Has</th>
                            <th>PesosHas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporte.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.fecha}</td>
                                <td>{item.semana}</td>
                                <td>{item.numEconomico}</td>
                                <td>{item.hr_km}</td>
                                <td>{item.operador}</td>
                                <td>{item.tipoCombus}</td>
                                <td>{item.lts}</td>
                                <td>{item.campo}</td>
                                <td>{item.actividad}</td>
                                <td>{item.zona}</td>
                                <td>{item.precioSemanal}</td>
                                <td>{item.precioConsumo}</td>
                                <td>{item.ultKm}</td>
                                <td>{item.km}</td>
                                <td>{item.rendimiento}</td>
                                <td>{item.cc}</td>
                                <td>{item.has}</td>
                                <td>{item.pesosHas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
