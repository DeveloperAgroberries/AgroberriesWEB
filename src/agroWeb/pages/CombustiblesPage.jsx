import { useEffect, useState, useRef } from "react";
import { CombustiblesList } from "../components/Combustibles/CombustiblesList";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { getCombustibles } from "../../store/slices/combustiblesMod";
import { AddRegistroCombustible } from "../components/Combustibles/AddRegistroCombustible";
import { Modal, Button } from 'react-bootstrap';
import leaf_loader_slow from '../../../assets/leaf_loader_slow.gif';
import { DownloadTableExcel } from "react-export-table-to-excel";

export const CombustiblesPage = () => {

    const dispatch = useDispatch();
    const { data: combustibleData, isLoading, errorMessage } = CombustiblesList();
    const [showModal, setShowModal] = useState(false);
    const tableRef = useRef(null);

    const openModal = () => {
        setShowModal(true);
    }
    const closeModal = async () => {
        setShowModal(false);
        await dispatch(getCombustibles()); // Refrescar lista
    };

    //UNICO USEEFFECT QUE MUESTRA LA TABLA Y MODAL DE CARGA DESPUES DE 3 SEGUNDOS
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // console.log("combustibleData:", combustibleData);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        // Función de limpieza para evitar fugas de memoria
        return () => clearTimeout(timeout);
    }, [combustibleData]);

    const columns = [
        {
            name: "Número economico",
            selector: row => row.cNumeconAfi,
            sortable: true,
        },
        {
            name: "Fecha consumo",
            selector: row => row.dConsumoCom,
            sortable: true,
        },
        {
            name: "Nombre Trabajador",
            selector: row => row.vNombreTra,
            sortable: true,
        },
        {
            name: "Litros cargados",
            selector: row => row.nLitrosCom,
            sortable: true,
        },
        {
            name: "Campo",
            selector: row => row.cCodigoCam,
            // sortable: true,
        },
        {
            name: "Zona",
            selector: row => row.cCodigoZon,
            // sortable: true,
        },
        {
            name: "Actividad",
            selector: row => row.cCodigoAct,
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
                <h1>Combustibles</h1>
                <div className="d-flex justify-content-between align-items-center mt-3" style={{ marginBottom: '1%' }}>
                    <p className="m-0">Registro y consulta de consumo de combustibles.</p>
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
                    data={combustibleData}
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
                <div className="ms-2 mb-1 mt-2">
                    {/* <button className="btn btn-outline-success rounded-2 m-1" onClick={() => openActivoPopup(<AddActivo onClose={closeActivoPopup} />)}>Registrar Consumo de Combustible.</button> */}
                    <Button variant="success" onClick={() => openModal()}>
                        Registro de Combustible
                    </Button>
                    <table ref={tableRef} style={{ display: 'none' }}>
                        <thead>
                            <tr>
                                <th>Número economico</th>
                                <th>Fecha consumo</th>
                                <th>Nombre Trabajador</th>
                                <th>Litros cargados</th>
                                <th>Campo</th>
                                <th>Zona</th>
                                <th>Actividad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {combustibleData.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.cNumeconAfi}</td>
                                    <td>{item.dConsumoCom}</td>
                                    <td>{item.vNombreTra}</td>
                                    <td>{item.nLitrosCom}</td>
                                    <td>{item.cCodigoCam}</td>
                                    <td>{item.cCodigoZon}</td>
                                    <td>{item.cCodigoAct}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para agregar Consumo de combustible */}
            <Modal show={showModal} onHide={closeModal} size="lg" centered>
                <Modal.Header style={{ background: '#198754' }} closeButton>
                    <Modal.Title style={{ fontWeight: 'bold', color: 'white' }}>Registro de Combustible</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddRegistroCombustible onClose={closeModal} isModalOpen={showModal} />
                    <iframe src="https://petrointelligence.com/api/api_precios.html?consulta=nac&tipo=DIE" width="300px" height="200px"></iframe>
                    <iframe src="https://petrointelligence.com/api/api_precios.html?consulta=nac&tipo=REG" width="300px" height="200px"></iframe>
                </Modal.Body>
            </Modal>
        </>
    )
}
