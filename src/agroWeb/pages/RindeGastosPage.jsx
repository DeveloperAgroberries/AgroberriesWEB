import { useState, useEffect, useRef } from 'react';
import { rindegastosApi } from '../../api/rindeGastosApi';
import { DownloadTableExcel } from "react-export-table-to-excel";

// Estilos para la tabla (ya los tenías, solo los incluyo para el contexto)
const tableHeaderStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'left',
    backgroundColor: '#e6e6e6',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    fontSize: '0.85em',
};

const tableCellStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'left',
    fontSize: '0.8em',
    wordBreak: 'break-word',
    maxWidth: '150px', // Aumentado ligeramente para los nuevos campos
};

function RindegastosOperations() {
    const tableRef = useRef(null);
    const [expenses, setExpenses] = useState([]);
    const [singleExpense, setSingleExpense] = useState(null);
    const [integrationResult, setIntegrationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [categoryFilter, setCategoryFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const [singleExpenseIdInput, setSingleExpenseIdInput] = useState('');
    const [integrateExpenseIdInput, setIntegrateExpenseIdInput] = useState('');

    // --- ESTADOS PARA LA BÚSQUEDA DE USUARIOS ---
    const [userSearchInput, setUserSearchInput] = useState('');
    const [userSearchType, setUserSearchType] = useState('Id'); // 'Id' o 'Email'
    const [foundUser, setFoundUser] = useState(null);
    const [userError, setUserError] = useState(null);
    const [userLoading, setUserLoading] = useState(false);
    // ---------------------------------------------------

    // --- NUEVOS ESTADOS PARA LA BÚSQUEDA DE INFORMES DE GASTOS ---
    const reportsTableRef = useRef(null); // Ref para la tabla de informes
    const [expenseReports, setExpenseReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportsError, setReportsError] = useState(null);

    const [reportSinceFilter, setReportSinceFilter] = useState('');
    const [reportUntilFilter, setReportUntilFilter] = useState('');
    const [reportTypeDateFilter, setReportTypeDateFilter] = useState('1'); // 1 = CloseDate, 2 = SendDate
    const [reportCurrencyFilter, setReportCurrencyFilter] = useState('');
    const [reportStatusFilter, setReportStatusFilter] = useState(''); // 0 = Abierto, 1 = Cerrado, '' = Ambos
    const [reportExpensePolicyIdFilter, setReportExpensePolicyIdFilter] = useState('');
    const [reportIntegrationStatusFilter, setReportIntegrationStatusFilter] = useState(''); // 0 = No integrado, 1 = Integrado, '' = Ambos
    const [reportIntegrationCodeFilter, setReportIntegrationCodeFilter] = useState('');
    const [reportIntegrationDateFilter, setReportIntegrationDateFilter] = useState('');
    const [reportUserIdFilter, setReportUserIdFilter] = useState('');
    // -----------------------------------------------------------

    // Función auxiliar para formatear fechas a 'YYYY-MM-DD' para la API
    const formatDate = (date) => {
        if (!date) return undefined;
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    };

    const fetchExpenses = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const today = new Date();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            const defaultSince = formatDate(oneYearAgo);
            const defaultUntil = formatDate(new Date());

            const apiParams = {
                Since: params.startDate ? formatDate(params.startDate) : defaultSince,
                Until: params.endDate ? formatDate(params.endDate) : defaultUntil,
                ResultsPerPage: 200, // Máximo de resultados por página
                Page: 1,
                Currency: 'MXN', // Filtrar por MXN por defecto
                Category: params.categoryFilter || undefined,
                ...params
            };

            Object.keys(apiParams).forEach(key => {
                if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined) {
                    delete apiParams[key];
                }
            });

            const response = await rindegastosApi.get('/getExpenses', { params: apiParams });
            const allFetchedExpenses = response.data.Expenses || [];

            // Filtrado adicional en cliente si es necesario (aunque la API ya filtra por Category y Currency)
            const filteredOnClient = allFetchedExpenses.filter(expense => {
                const currencyMatches = expense.Currency === 'MXN';
                const categoryMatches = !params.categoryFilter ||
                    (expense.Category && expense.Category.toLowerCase().includes(params.categoryFilter.toLowerCase()));
                return currencyMatches && categoryMatches;
            });

            setExpenses(filteredOnClient);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleExpense = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rindegastosApi.get(`/getExpense?Id=${id}`);
            setSingleExpense(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const setExpenseIntegration = async (id, status, code = null, date = null) => {
        setLoading(true);
        setError(null);
        try {
            const payload = { Id: id, IntegrationStatus: status };
            if (code) payload.IntegrationCode = code;
            if (date) payload.IntegrationDate = date;

            const response = await rindegastosApi.put('/setExpenseIntegration', payload);
            setIntegrationResult(response.data);
            alert(`Gasto ${id} actualizado. Estado de integración: ${status === 1 ? 'Integrado' : 'No Integrado'}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- FUNCIÓN PARA BUSCAR USUARIO ---
    const fetchUser = async () => {
        setUserLoading(true);
        setUserError(null);
        setFoundUser(null); // Limpiar usuario previo
        try {
            let params = {};
            if (userSearchType === 'Id') {
                if (!userSearchInput || isNaN(parseInt(userSearchInput))) {
                    setUserError('Por favor, ingresa un ID de usuario válido.');
                    setUserLoading(false); // Detener la carga aquí también
                    return;
                }
                params.Id = parseInt(userSearchInput);
            } else { // userSearchType === 'Email'
                if (!userSearchInput || !userSearchInput.includes('@')) {
                    setUserError('Por favor, ingresa un correo electrónico válido.');
                    setUserLoading(false); // Detener la carga aquí también
                    return;
                }
                params.Email = userSearchInput;
            }

            const response = await rindegastosApi.get('/getUser', { params });
            setFoundUser(response.data);
        } catch (err) {
            setUserError(err.response?.data?.message || err.message || 'Error al buscar usuario.');
        } finally {
            setUserLoading(false);
        }
    };
    // ------------------------------------------

    // --- NUEVA FUNCIÓN PARA BUSCAR INFORMES DE GASTOS ---
    const fetchExpenseReports = async () => {
        setReportsLoading(true);
        setReportsError(null);
        try {
            const today = new Date();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            const defaultSince = formatDate(oneYearAgo);
            const defaultUntil = formatDate(new Date());

            const apiParams = {
                Since: reportSinceFilter || defaultSince, // Since es obligatorio y tiene un valor por defecto si no se ingresa
                Until: reportUntilFilter || defaultUntil,
                TypeDateFilter: parseInt(reportTypeDateFilter),
                Currency: reportCurrencyFilter || undefined,
                Status: reportStatusFilter !== '' ? parseInt(reportStatusFilter) : undefined,
                ExpensePolicyId: reportExpensePolicyIdFilter ? parseInt(reportExpensePolicyIdFilter) : undefined,
                IntegrationStatus: reportIntegrationStatusFilter !== '' ? parseInt(reportIntegrationStatusFilter) : undefined,
                IntegrationCode: reportIntegrationCodeFilter || undefined,
                IntegrationDate: reportIntegrationDateFilter || undefined,
                UserId: reportUserIdFilter ? parseInt(reportUserIdFilter) : undefined,
                // OrderBy y Order se pueden añadir si es necesario, aquí se usarán los defaults de la API
                // OrderBy: 2, // Por defecto SendDate
                // Order: 'DESC', // Por defecto DESC
                ResultsPerPage: 200,
                Page: 1,
            };

            // Limpiar parámetros vacíos o nulos para que no se envíen a la API si no tienen valor
            Object.keys(apiParams).forEach(key => {
                if (apiParams[key] === '' || apiParams[key] === null || apiParams[key] === undefined || (typeof apiParams[key] === 'number' && isNaN(apiParams[key]))) {
                    delete apiParams[key];
                }
            });

            // Validación para 'Since' obligatorio
            if (!apiParams.Since) {
                setReportsError("El campo 'Fecha Desde' (Since) es obligatorio para buscar informes.");
                setReportsLoading(false);
                return;
            }

            // Validación de rango de un año máximo
            const sinceDate = new Date(apiParams.Since);
            const untilDate = new Date(apiParams.Until || defaultUntil); // Usar defaultUntil si Until no está definido
            const oneYearFromSince = new Date(sinceDate);
            oneYearFromSince.setFullYear(sinceDate.getFullYear() + 1);

            if (untilDate > oneYearFromSince) {
                setReportsError("El rango entre 'Fecha Desde' y 'Fecha Hasta' no puede exceder un año.");
                setReportsLoading(false);
                return;
            }


            const response = await rindegastosApi.get('/getExpenseReports', { params: apiParams });
            setExpenseReports(response.data.ExpenseReports || []);
        } catch (err) {
            setReportsError(err.response?.data?.message || err.message || 'Error al buscar informes de gastos.');
        } finally {
            setReportsLoading(false);
        }
    };
    // -------------------------------------------------------------

    useEffect(() => {
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const formattedToday = formatDate(today);
        const formattedOneYearAgo = formatDate(oneYearAgo);

        setStartDateFilter(formattedOneYearAgo);
        setEndDateFilter(formattedToday);
        setReportSinceFilter(formattedOneYearAgo); // Establecer valor por defecto para informes
        setReportUntilFilter(formattedToday); // Establecer valor por defecto para informes


        fetchExpenses({ Since: formattedOneYearAgo, Until: formattedToday, ResultsPerPage: 5 });
    }, []);

    const searchExampleCategory = () => {
        const exampleCategory = "MANTENIMIENTO DE CAMPO";
        setCategoryFilter(exampleCategory);
        fetchExpenses({
            categoryFilter: exampleCategory,
            startDate: startDateFilter,
            endDate: endDateFilter
        });
    };

    const handleSearch = () => {
        fetchExpenses({
            categoryFilter: categoryFilter,
            startDate: startDateFilter,
            endDate: endDateFilter
        });
    };

    const handleClearFilters = () => {
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const formattedToday = formatDate(today);
        const formattedOneYearAgo = formatDate(oneYearAgo);

        setCategoryFilter('');
        setStartDateFilter(formattedOneYearAgo);
        setEndDateFilter(formattedToday);

        fetchExpenses({ Since: formattedOneYearAgo, Until: formattedToday, ResultsPerPage: 5 });
    };

    return (
        <>
            <br />
            <br />
            <div id="pagesContainer" className="container-fluid h rounded-3 p-3 mt-5 animate__animated animate__fadeIn">
                <h1>Operaciones con la API de Rindegastos</h1>

                {loading && <p style={{ color: 'blue' }}>Cargando...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <hr />

                <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                    <h2>Buscar Gastos (Filtros Múltiples)</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Nombre de la Categoría (ej. 'Mantenimiento de Campo')"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ padding: '8px', flex: '1 1 300px' }}
                        />
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            style={{ padding: '8px', flex: '1 1 150px' }}
                            title="Fecha de Inicio"
                        />
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            style={{ padding: '8px', flex: '1 1 150px' }}
                            title="Fecha de Fin"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            Buscar Gastos
                        </button>
                        <button
                            onClick={searchExampleCategory}
                            disabled={loading}
                            style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            Buscar Categoría de Ejemplo
                        </button>
                        <button
                            onClick={handleClearFilters}
                            disabled={loading}
                            style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            Limpiar Filtros
                        </button>
                    </div>

                    <div style={{ marginTop: '15px'}}>
                        <DownloadTableExcel
                            filename="Reporte Rindegastos"
                            sheet="Gastos"
                            currentTableRef={tableRef.current}
                        >
                            <button className="btn btn-outline-success rounded-2">Exportar a Excel</button>
                        </DownloadTableExcel>
                    </div>

                    <h3 style={{ marginTop: '20px' }}>Resultados de Gastos (Solo MXN):</h3>
                    {expenses.length > 0 ? (
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>ID</th>
                                        <th style={tableHeaderStyle}>Estado</th>
                                        <th style={tableHeaderStyle}>Proveedor</th>
                                        <th style={tableHeaderStyle}>Fecha Emisión</th>
                                        <th style={tableHeaderStyle}>Monto Original</th>
                                        <th style={tableHeaderStyle}>Moneda Original</th>
                                        <th style={tableHeaderStyle}>Tasa Cambio</th>
                                        <th style={tableHeaderStyle}>Neto</th>
                                        <th style={tableHeaderStyle}>Impuesto</th>
                                        <th style={tableHeaderStyle}>Nombre Impuesto</th>
                                        <th style={tableHeaderStyle}>Otros Impuestos</th>
                                        <th style={tableHeaderStyle}>Nombre Retención</th>
                                        <th style={tableHeaderStyle}>Retención</th>
                                        <th style={tableHeaderStyle}>Total</th>
                                        <th style={tableHeaderStyle}>Moneda</th>
                                        <th style={tableHeaderStyle}>Reembolsable</th>
                                        <th style={tableHeaderStyle}>Categoría</th>
                                        <th style={tableHeaderStyle}>Código Categoría</th>
                                        <th style={tableHeaderStyle}>Grupo Categoría</th>
                                        <th style={tableHeaderStyle}>Código Grupo Cat.</th>
                                        <th style={tableHeaderStyle}>Nota</th>
                                        <th style={tableHeaderStyle}>Fecha Integración</th>
                                        <th style={tableHeaderStyle}>Código Ext. Integración</th>
                                        <th style={tableHeaderStyle}>Campos Extra</th>
                                        <th style={tableHeaderStyle}>Archivos (Cant.)</th>
                                        <th style={tableHeaderStyle}>Enlace Primer Archivo</th>
                                        <th style={tableHeaderStyle}>ID Informe</th>
                                        <th style={tableHeaderStyle}>ID Política Gasto</th>
                                        <th style={tableHeaderStyle}>ID Usuario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(expense => (
                                        <tr key={expense.Id}>
                                            <td style={tableCellStyle}>{expense.Id}</td>
                                            <td style={tableCellStyle}>{
                                                expense.Status === 1 ? 'Aprobado' :
                                                    expense.Status === 0 ? 'En Proceso' :
                                                        'Rechazado'
                                            }</td>
                                            <td style={tableCellStyle}>{expense.Supplier || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.IssueDate || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.OriginalAmount?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.OriginalCurrency || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.ExchangeRate?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.Net?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.Tax?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.TaxName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.OtherTaxes?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.RetentionName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.Retention?.toFixed(2) || '0.00'}</td>
                                            <td style={tableCellStyle}>{expense.Total?.toFixed(2)} {expense.Currency}</td>
                                            <td style={tableCellStyle}>{expense.Currency || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.Reimbursable ? 'Sí' : 'No'}</td>
                                            <td style={tableCellStyle}>{expense.Category || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.CategoryCode || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.CategoryGroup || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.CategoryGroupCode || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.Note || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.IntegrationDate || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.IntegrationExternalCode || 'N/A'}</td>
                                            <td style={tableCellStyle}>
                                                {expense.ExtraFields && expense.ExtraFields.length > 0 ? 'Sí' : 'No'}
                                            </td>
                                            <td style={tableCellStyle}>{expense.NbrFiles || '0'}</td>
                                            <td style={tableCellStyle}>
                                                {expense.Files && expense.Files.length > 0 && expense.Files[0].Original ? (
                                                    <a href={expense.Files[0].Original} target="_blank" rel="noopener noreferrer">Ver</a>
                                                ) : 'N/A'}
                                            </td>
                                            <td style={tableCellStyle}>{expense.ReportId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.ExpensePolicyId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{expense.UserId || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !loading && <p>No se encontraron gastos con los criterios especificados.</p>
                    )}
                </section>

                <hr />

                {/* --- SECCIÓN PARA BUSCAR USUARIOS --- */}
                <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                    <h2>Obtener Información de Usuario (`getUser`)</h2>
                    <p>Busca un usuario por su ID o Correo Electrónico.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <select
                            value={userSearchType}
                            onChange={(e) => setUserSearchType(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="Id">ID de Usuario</option>
                            <option value="Email">Correo Electrónico</option>
                        </select>
                        <input
                            type={userSearchType === 'Id' ? 'number' : 'text'}
                            value={userSearchInput}
                            onChange={(e) => setUserSearchInput(e.target.value)}
                            placeholder={userSearchType === 'Id' ? 'Ej. 2' : 'Ej. usuario@empresa.com'}
                            style={{ padding: '8px', flex: '1', minWidth: '200px' }}
                        />
                        <button
                            onClick={fetchUser}
                            disabled={userLoading}
                            style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            {userLoading ? 'Buscando...' : 'Buscar Usuario'}
                        </button>
                    </div>

                    {userLoading && <p style={{ color: 'blue' }}>Cargando información de usuario...</p>}
                    {userError && <p style={{ color: 'red' }}>Error al buscar usuario: {userError}</p>}

                    {foundUser && (
                        <div style={{ marginTop: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                            <h3>Detalle del Usuario (ID: {foundUser.Id}):</h3>
                            <p><strong>Nombre:</strong> {foundUser.FirstName || 'N/A'} {foundUser.LastName || 'N/A'}</p>
                            <p><strong>Identificación:</strong> {foundUser.Identification || 'N/A'}</p>
                            <p><strong>Código de Costo:</strong> {foundUser.CostingCode || 'N/A'}</p>
                            <p><strong>Número de Empleado:</strong> {foundUser.EmployeeNumber || 'N/A'}</p>
                            <p><strong>Departamento:</strong> {foundUser.Department || 'N/A'}</p>
                            <p><strong>Puesto:</strong> {foundUser.Position || 'N/A'}</p>
                            <p><strong>Fecha de Creación:</strong> {foundUser.CreatedAt || 'N/A'}</p>
                            <p><strong>Último Inicio de Sesión:</strong> {foundUser.LastLogin || 'N/A'}</p>
                            <p>
                                <strong>Rol:</strong>
                                {foundUser.Role && foundUser.Role.length > 0 ? (
                                    <span>
                                        Admin: {foundUser.Role[0].Admin ? 'Sí' : 'No'}, Gestión: {foundUser.Role[0].Management ? 'Sí' : 'No'}
                                    </span>
                                ) : 'N/A'}
                            </p>
                        </div>
                    )}
                </section>
                {/* ------------------------------------------- */}

                <hr />

                {/* --- NUEVA SECCIÓN PARA BUSCAR INFORMES DE GASTOS --- */}
                <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                    <h2>Buscar Informes de Gastos (`getExpenseReports`)</h2>
                    <p>Filtra informes de gastos según varios criterios.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="date"
                            value={reportSinceFilter}
                            onChange={(e) => setReportSinceFilter(e.target.value)}
                            style={{ padding: '8px', flex: '1 1 150px' }}
                            title="Fecha Desde (Obligatorio)"
                        />
                        <input
                            type="date"
                            value={reportUntilFilter}
                            onChange={(e) => setReportUntilFilter(e.target.value)}
                            style={{ padding: '8px', flex: '1 1 150px' }}
                            title="Fecha Hasta"
                        />
                        <select
                            value={reportTypeDateFilter}
                            onChange={(e) => setReportTypeDateFilter(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
                            title="Filtrar por Fecha"
                        >
                            <option value="1">Fecha de Cierre (CloseDate)</option>
                            <option value="2">Fecha de Envío (SendDate)</option>
                        </select>
                        <input
                            type="text"
                            value={reportCurrencyFilter}
                            onChange={(e) => setReportCurrencyFilter(e.target.value)}
                            placeholder="Moneda (ej. MXN)"
                            style={{ padding: '8px', flex: '1 1 100px' }}
                        />
                        <select
                            value={reportStatusFilter}
                            onChange={(e) => setReportStatusFilter(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 100px' }}
                            title="Estado del Informe"
                        >
                            <option value="">Cualquier Estado</option>
                            <option value="0">Abierto / En Proceso</option>
                            <option value="1">Cerrado</option>
                        </select>
                        <input
                            type="number"
                            value={reportExpensePolicyIdFilter}
                            onChange={(e) => setReportExpensePolicyIdFilter(e.target.value)}
                            placeholder="ID Política Gasto"
                            style={{ padding: '8px', flex: '1 1 120px' }}
                        />
                        <select
                            value={reportIntegrationStatusFilter}
                            onChange={(e) => setReportIntegrationStatusFilter(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 120px' }}
                            title="Estado de Integración"
                        >
                            <option value="">Cualquier Estado</option>
                            <option value="0">No Integrado</option>
                            <option value="1">Integrado</option>
                        </select>
                        <input
                            type="text"
                            value={reportIntegrationCodeFilter}
                            onChange={(e) => setReportIntegrationCodeFilter(e.target.value)}
                            placeholder="Código Integración"
                            style={{ padding: '8px', flex: '1 1 150px' }}
                        />
                        <input
                            type="date"
                            value={reportIntegrationDateFilter}
                            onChange={(e) => setReportIntegrationDateFilter(e.target.value)}
                            placeholder="Fecha Integración"
                            style={{ padding: '8px', flex: '1 1 150px' }}
                            title="Fecha de Integración"
                        />
                        <input
                            type="number"
                            value={reportUserIdFilter}
                            onChange={(e) => setReportUserIdFilter(e.target.value)}
                            placeholder="ID Usuario"
                            style={{ padding: '8px', flex: '1 1 100px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={fetchExpenseReports}
                            disabled={reportsLoading}
                            style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            {reportsLoading ? 'Buscando...' : 'Buscar Informes'}
                        </button>
                        <button
                            onClick={() => {
                                // Limpiar filtros de informes
                                const today = new Date();
                                const oneYearAgo = new Date(today);
                                oneYearAgo.setFullYear(today.getFullYear() - 1);
                                setReportSinceFilter(formatDate(oneYearAgo));
                                setReportUntilFilter(formatDate(today));
                                setReportTypeDateFilter('1');
                                setReportCurrencyFilter('');
                                setReportStatusFilter('');
                                setReportExpensePolicyIdFilter('');
                                setReportIntegrationStatusFilter('');
                                setReportIntegrationCodeFilter('');
                                setReportIntegrationDateFilter('');
                                setReportUserIdFilter('');
                                setExpenseReports([]); // Limpiar resultados
                                setReportsError(null); // Limpiar errores
                            }}
                            disabled={reportsLoading}
                            style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none' }}
                        >
                            Limpiar Filtros Informes
                        </button>
                    </div>

                    {reportsLoading && <p style={{ color: 'blue' }}>Cargando informes de gastos...</p>}
                    {reportsError && <p style={{ color: 'red' }}>Error: {reportsError}</p>}

                    <div style={{ marginTop: '15px'}}>
                        <DownloadTableExcel
                            filename="Informes de Gastos Rindegastos"
                            sheet="Informes"
                            currentTableRef={reportsTableRef.current}
                        >
                            <button className="btn btn-outline-success rounded-2">Exportar Informes a Excel</button>
                        </DownloadTableExcel>
                    </div>

                    <h3 style={{ marginTop: '20px' }}>Resultados de Informes de Gastos:</h3>
                    {expenseReports.length > 0 ? (
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table ref={reportsTableRef} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>ID</th>
                                        <th style={tableHeaderStyle}>Título</th>
                                        <th style={tableHeaderStyle}>Número de Informe</th>
                                        <th style={tableHeaderStyle}>Fecha de Envío</th>
                                        <th style={tableHeaderStyle}>Fecha de Cierre</th>
                                        <th style={tableHeaderStyle}>ID Empleado</th>
                                        <th style={tableHeaderStyle}>Nombre Empleado</th>
                                        <th style={tableHeaderStyle}>Identificación Empleado</th>
                                        <th style={tableHeaderStyle}>ID Aprobador</th>
                                        <th style={tableHeaderStyle}>Nombre Aprobador</th>
                                        <th style={tableHeaderStyle}>ID Política</th>
                                        <th style={tableHeaderStyle}>Nombre Política</th>
                                        <th style={tableHeaderStyle}>Estado</th>
                                        <th style={tableHeaderStyle}>Estado Personalizado</th>
                                        <th style={tableHeaderStyle}>ID Fondo</th>
                                        <th style={tableHeaderStyle}>Nombre Fondo</th>
                                        <th style={tableHeaderStyle}>Total Informe</th>
                                        <th style={tableHeaderStyle}>Total Aprobado</th>
                                        <th style={tableHeaderStyle}>Moneda</th>
                                        <th style={tableHeaderStyle}>Nota</th>
                                        <th style={tableHeaderStyle}>Integrado</th>
                                        <th style={tableHeaderStyle}>Fecha Integración</th>
                                        <th style={tableHeaderStyle}>Código Ext. Integración</th>
                                        <th style={tableHeaderStyle}>Código Int. Integración</th>
                                        <th style={tableHeaderStyle}>Número de Gastos</th>
                                        <th style={tableHeaderStyle}>Gastos Aprobados</th>
                                        <th style={tableHeaderStyle}>Gastos Rechazados</th>
                                        <th style={tableHeaderStyle}>Campos Extra</th>
                                        <th style={tableHeaderStyle}>Archivos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseReports.map(report => (
                                        <tr key={report.Id}>
                                            <td style={tableCellStyle}>{report.Id}</td>
                                            <td style={tableCellStyle}>{report.Title || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.ReportNumber || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.SendDate || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.CloseDate || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.EmployeeId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.EmployeeName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.EmployeeIdentification || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.ApproverId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.ApproverName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.PolicyId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.PolicyName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{
                                                report.Status === 1 ? 'Cerrado' :
                                                report.Status === 0 ? 'Abierto / En Proceso' :
                                                'Desconocido'
                                            }</td>
                                            <td style={tableCellStyle}>{report.CustomStatus || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.FundId || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.FundName || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.ReportTotal?.toFixed(2)}</td>
                                            <td style={tableCellStyle}>{report.ReportTotalApproved?.toFixed(2)}</td>
                                            <td style={tableCellStyle}>{report.Currency || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.Note || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.Integrated === 1 ? 'Sí' : report.Integrated === 0 ? 'No' : 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.IntegrationDate || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.IntegrationExternalCode || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.IntegrationInternalCode || 'N/A'}</td>
                                            <td style={tableCellStyle}>{report.NbrExpenses || '0'}</td>
                                            <td style={tableCellStyle}>{report.NbrApprovedExpenses || '0'}</td>
                                            <td style={tableCellStyle}>{report.NbrRejectedExpenses || '0'}</td>
                                            <td style={tableCellStyle}>
                                                {report.ExtraFields && report.ExtraFields.length > 0 ? (
                                                    report.ExtraFields.map((field, idx) => (
                                                        <div key={idx}>
                                                            <strong>{field.Name}:</strong> {field.Value} ({field.Code})
                                                        </div>
                                                    ))
                                                ) : 'N/A'}
                                            </td>
                                            <td style={tableCellStyle}>
                                                {report.Files && report.Files.length > 0 ? (
                                                    report.Files.map((file, idx) => (
                                                        <div key={idx}>
                                                            <a href={file.Original} target="_blank" rel="noopener noreferrer">Archivo {idx + 1}</a>
                                                        </div>
                                                    ))
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !reportsLoading && <p>No se encontraron informes de gastos con los criterios especificados.</p>
                    )}
                </section>
                {/* --------------------------------------------------- */}

            </div>
        </>
    );
}

export default RindegastosOperations;